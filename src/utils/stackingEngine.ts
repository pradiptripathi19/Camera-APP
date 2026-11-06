/**
 * Multi-Frame Astrophotography & Super-Resolution Stacking Engine
 * Implements real statistical stacking algorithms:
 * - Average Stacking (reduces random read & shot noise by sqrt(N))
 * - Median Stacking (rejects airplanes, satellites, transient cosmic rays)
 * - Sigma-Clipping (astronomical standard outlier rejection + mean)
 * - Maximum Detail (sharpness / gradient weighted fusion)
 * - Star & Lunar Centroid Alignment (motion drift compensation)
 */

import { StackingAlgorithm } from '../types/camera';

export interface FramePixelData {
  width: number;
  height: number;
  data: Uint8ClampedArray; // RGBA
}

/**
 * Calculates 500 Rule maximum exposure time before star trails form
 * Formula: 500 / (focal_length_mm * 35mm_crop_factor)
 */
export function calculateStarTrailLimit(focalLengthMm: number = 5.2, cropFactor: number = 4.6): number {
  const equivalent35mm = focalLengthMm * cropFactor;
  const maxSeconds = 500 / equivalent35mm;
  return Math.round(maxSeconds * 10) / 10;
}

/**
 * Average Stacking
 */
export function stackFramesAverage(frames: FramePixelData[]): FramePixelData {
  if (frames.length === 0) throw new Error('No frames provided for stacking');
  if (frames.length === 1) return frames[0];

  const { width, height } = frames[0];
  const pixelCount = width * height;
  const totalBytes = pixelCount * 4;
  const resultData = new Uint8ClampedArray(totalBytes);
  const frameCount = frames.length;

  // 32-bit accumulators for RGB
  const accumR = new Float32Array(pixelCount);
  const accumG = new Float32Array(pixelCount);
  const accumB = new Float32Array(pixelCount);

  for (let f = 0; f < frameCount; f++) {
    const data = frames[f].data;
    for (let i = 0, p = 0; p < pixelCount; i += 4, p++) {
      accumR[p] += data[i];
      accumG[p] += data[i + 1];
      accumB[p] += data[i + 2];
    }
  }

  for (let i = 0, p = 0; p < pixelCount; i += 4, p++) {
    resultData[i] = Math.round(accumR[p] / frameCount);
    resultData[i + 1] = Math.round(accumG[p] / frameCount);
    resultData[i + 2] = Math.round(accumB[p] / frameCount);
    resultData[i + 3] = 255; // Alpha
  }

  return { width, height, data: resultData };
}

/**
 * Median Stacking
 * Sorts values per pixel channel across all frames and takes the middle value
 */
export function stackFramesMedian(frames: FramePixelData[]): FramePixelData {
  if (frames.length === 0) throw new Error('No frames provided for stacking');
  if (frames.length === 1) return frames[0];

  const { width, height } = frames[0];
  const pixelCount = width * height;
  const totalBytes = pixelCount * 4;
  const resultData = new Uint8ClampedArray(totalBytes);
  const frameCount = frames.length;
  const midIndex = Math.floor(frameCount / 2);

  // Reuse small arrays per pixel to prevent GC pressure
  const channelValues = new Float32Array(frameCount);

  for (let p = 0; p < pixelCount; p++) {
    const byteOffset = p * 4;

    // Red channel
    for (let f = 0; f < frameCount; f++) {
      channelValues[f] = frames[f].data[byteOffset];
    }
    channelValues.sort();
    resultData[byteOffset] = Math.round(channelValues[midIndex]);

    // Green channel
    for (let f = 0; f < frameCount; f++) {
      channelValues[f] = frames[f].data[byteOffset + 1];
    }
    channelValues.sort();
    resultData[byteOffset + 1] = Math.round(channelValues[midIndex]);

    // Blue channel
    for (let f = 0; f < frameCount; f++) {
      channelValues[f] = frames[f].data[byteOffset + 2];
    }
    channelValues.sort();
    resultData[byteOffset + 2] = Math.round(channelValues[midIndex]);

    resultData[byteOffset + 3] = 255;
  }

  return { width, height, data: resultData };
}

/**
 * Sigma-Clipping Stacking (Professional Astrophotography Standard)
 * Computes mean and standard deviation per channel.
 * Discards values outside [mean - sigma*std, mean + sigma*std].
 * Then calculates the mean of surviving values.
 */
export function stackFramesSigmaClipping(
  frames: FramePixelData[],
  sigmaThreshold: number = 2.0
): FramePixelData {
  if (frames.length === 0) throw new Error('No frames provided for stacking');
  if (frames.length <= 2) return stackFramesAverage(frames);

  const { width, height } = frames[0];
  const pixelCount = width * height;
  const totalBytes = pixelCount * 4;
  const resultData = new Uint8ClampedArray(totalBytes);
  const frameCount = frames.length;

  const values = new Float32Array(frameCount);

  for (let p = 0; p < pixelCount; p++) {
    const byteOffset = p * 4;

    for (let c = 0; c < 3; c++) {
      const channelOffset = byteOffset + c;
      let sum = 0;

      for (let f = 0; f < frameCount; f++) {
        const val = frames[f].data[channelOffset];
        values[f] = val;
        sum += val;
      }

      const mean = sum / frameCount;

      // Variance calculation
      let varianceSum = 0;
      for (let f = 0; f < frameCount; f++) {
        const diff = values[f] - mean;
        varianceSum += diff * diff;
      }
      const stdDev = Math.sqrt(varianceSum / frameCount);

      const lowerLimit = mean - sigmaThreshold * stdDev;
      const upperLimit = mean + sigmaThreshold * stdDev;

      let keptSum = 0;
      let keptCount = 0;

      for (let f = 0; f < frameCount; f++) {
        const val = values[f];
        if (val >= lowerLimit && val <= upperLimit) {
          keptSum += val;
          keptCount++;
        }
      }

      // If all clipped, fallback to mean
      const finalVal = keptCount > 0 ? keptSum / keptCount : mean;
      resultData[channelOffset] = Math.round(Math.min(255, Math.max(0, finalVal)));
    }

    resultData[byteOffset + 3] = 255;
  }

  return { width, height, data: resultData };
}

/**
 * Maximum Detail Stacking
 * Computes local contrast/gradient and weights pixel contribution by sharpness.
 */
export function stackFramesMaxDetail(frames: FramePixelData[]): FramePixelData {
  if (frames.length === 0) throw new Error('No frames provided for stacking');
  if (frames.length === 1) return frames[0];

  const { width, height } = frames[0];
  const pixelCount = width * height;
  const resultData = new Uint8ClampedArray(pixelCount * 4);
  const frameCount = frames.length;

  // Simple Laplacian gradient sharpness per pixel per frame
  const weights = new Float32Array(frameCount * pixelCount);

  for (let f = 0; f < frameCount; f++) {
    const data = frames[f].data;
    const frameWeightOffset = f * pixelCount;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x);
        const byteIdx = idx * 4;

        // Luminance
        const center = 0.299 * data[byteIdx] + 0.587 * data[byteIdx + 1] + 0.114 * data[byteIdx + 2];
        const top = 0.299 * data[byteIdx - width * 4] + 0.587 * data[byteIdx - width * 4 + 1] + 0.114 * data[byteIdx - width * 4 + 2];
        const bottom = 0.299 * data[byteIdx + width * 4] + 0.587 * data[byteIdx + width * 4 + 1] + 0.114 * data[byteIdx + width * 4 + 2];
        const left = 0.299 * data[byteIdx - 4] + 0.587 * data[byteIdx - 3] + 0.114 * data[byteIdx - 2];
        const right = 0.299 * data[byteIdx + 4] + 0.587 * data[byteIdx + 5] + 0.114 * data[byteIdx + 6];

        // 2D discrete Laplacian edge response
        const laplacian = Math.abs(4 * center - top - bottom - left - right);
        weights[frameWeightOffset + idx] = laplacian + 1.0; // base weight of 1.0
      }
    }
  }

  // Blending weighted by sharpness
  for (let p = 0; p < pixelCount; p++) {
    const byteOffset = p * 4;
    let totalWeight = 0;
    let rSum = 0;
    let gSum = 0;
    let bSum = 0;

    for (let f = 0; f < frameCount; f++) {
      const w = weights[f * pixelCount + p] || 1.0;
      const data = frames[f].data;
      totalWeight += w;
      rSum += data[byteOffset] * w;
      gSum += data[byteOffset + 1] * w;
      bSum += data[byteOffset + 2] * w;
    }

    resultData[byteOffset] = Math.round(rSum / totalWeight);
    resultData[byteOffset + 1] = Math.round(gSum / totalWeight);
    resultData[byteOffset + 2] = Math.round(bSum / totalWeight);
    resultData[byteOffset + 3] = 255;
  }

  return { width, height, data: resultData };
}

/**
 * Bright Object Centroid Finder for Star and Moon Alignment
 */
export function findBrightCentroid(frame: FramePixelData, thresholdPct: number = 0.85): { cx: number; cy: number; mass: number } {
  const { width, height, data } = frame;
  const threshold = 255 * thresholdPct;
  let totalMass = 0;
  let weightedX = 0;
  let weightedY = 0;

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const idx = (y * width + x) * 4;
      const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      if (lum > threshold) {
        const weight = lum - threshold;
        totalMass += weight;
        weightedX += x * weight;
        weightedY += y * weight;
      }
    }
  }

  if (totalMass === 0) {
    return { cx: width / 2, cy: height / 2, mass: 0 };
  }

  return {
    cx: weightedX / totalMass,
    cy: weightedY / totalMass,
    mass: totalMass,
  };
}

/**
 * Translates a frame by (dx, dy) with zero-padding
 */
export function translateFrame(frame: FramePixelData, dx: number, dy: number): FramePixelData {
  const intDx = Math.round(dx);
  const intDy = Math.round(dy);
  if (intDx === 0 && intDy === 0) return frame;

  const { width, height, data } = frame;
  const shiftedData = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y++) {
    const srcY = y - intDy;
    if (srcY < 0 || srcY >= height) continue;

    for (let x = 0; x < width; x++) {
      const srcX = x - intDx;
      if (srcX < 0 || srcX >= width) continue;

      const destIdx = (y * width + x) * 4;
      const srcIdx = (srcY * width + srcX) * 4;

      shiftedData[destIdx] = data[srcIdx];
      shiftedData[destIdx + 1] = data[srcIdx + 1];
      shiftedData[destIdx + 2] = data[srcIdx + 2];
      shiftedData[destIdx + 3] = data[srcIdx + 3];
    }
  }

  return { width, height, data: shiftedData };
}

/**
 * Motion-Aware Align and Stack
 */
export function alignAndStackFrames(
  frames: FramePixelData[],
  algorithm: StackingAlgorithm = 'average',
  sigmaThreshold: number = 2.0
): FramePixelData {
  if (frames.length <= 1) return frames[0];

  // Align to first frame
  const refCentroid = findBrightCentroid(frames[0]);
  const alignedFrames: FramePixelData[] = [frames[0]];

  for (let i = 1; i < frames.length; i++) {
    const currentCentroid = findBrightCentroid(frames[i]);
    if (refCentroid.mass > 0 && currentCentroid.mass > 0) {
      const dx = refCentroid.cx - currentCentroid.cx;
      const dy = refCentroid.cy - currentCentroid.cy;
      // Guard against wild jumps (e.g. > 15% of frame)
      if (Math.abs(dx) < frames[0].width * 0.15 && Math.abs(dy) < frames[0].height * 0.15) {
        alignedFrames.push(translateFrame(frames[i], dx, dy));
      } else {
        alignedFrames.push(frames[i]);
      }
    } else {
      alignedFrames.push(frames[i]);
    }
  }

  switch (algorithm) {
    case 'median':
      return stackFramesMedian(alignedFrames);
    case 'sigma_clipping':
      return stackFramesSigmaClipping(alignedFrames, sigmaThreshold);
    case 'max_detail':
      return stackFramesMaxDetail(alignedFrames);
    case 'average':
    default:
      return stackFramesAverage(alignedFrames);
  }
}
