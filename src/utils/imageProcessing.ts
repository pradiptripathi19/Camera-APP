import { FilterPreset } from '../types/camera';

/**
 * 28 Professional Filters (Natural, Cinematic, Film, Portrait, Creative)
 * Designed for Xiaomi Pro Camera
 */
export const CAMERA_FILTERS: FilterPreset[] = [
  // 1-5 Natural
  {
    id: 'natural',
    name: 'Natural',
    category: 'Natural',
    cssFilter: 'none',
    contrast: 0,
    saturation: 0,
    brightness: 0,
  },
  {
    id: 'vivid',
    name: 'Vivid',
    category: 'Natural',
    cssFilter: 'contrast(1.15) saturate(1.3) brightness(1.02)',
    contrast: 15,
    saturation: 30,
    brightness: 2,
  },
  {
    id: 'enhanced',
    name: 'Enhanced',
    category: 'Natural',
    cssFilter: 'contrast(1.2) saturate(1.25) brightness(1.05)',
    contrast: 20,
    saturation: 25,
    brightness: 5,
  },
  {
    id: 'soft',
    name: 'Soft',
    category: 'Natural',
    cssFilter: 'contrast(0.9) saturate(0.95) brightness(1.04)',
    contrast: -10,
    saturation: -5,
    brightness: 4,
  },
  {
    id: 'clear',
    name: 'Clear',
    category: 'Natural',
    cssFilter: 'contrast(1.1) saturate(1.1) brightness(1.08)',
    contrast: 10,
    saturation: 10,
    brightness: 8,
  },

  // 6-10 Cinematic
  {
    id: 'cinematic_warm',
    name: 'Cinematic Warm',
    category: 'Cinematic',
    cssFilter: 'sepia(0.2) contrast(1.15) saturate(1.15) hue-rotate(-10deg)',
    temperature: 6800,
    contrast: 15,
    saturation: 15,
  },
  {
    id: 'cinematic_cool',
    name: 'Cinematic Cool',
    category: 'Cinematic',
    cssFilter: 'sepia(0.1) contrast(1.18) saturate(1.1) hue-rotate(185deg)',
    temperature: 4200,
    contrast: 18,
    saturation: 10,
  },
  {
    id: 'teal_and_orange',
    name: 'Teal and Orange',
    category: 'Cinematic',
    cssFilter: 'contrast(1.25) saturate(1.35) hue-rotate(-15deg)',
    contrast: 25,
    saturation: 35,
  },
  {
    id: 'movie_film',
    name: 'Movie Film',
    category: 'Cinematic',
    cssFilter: 'contrast(1.2) saturate(0.9) brightness(0.98) sepia(0.15)',
    contrast: 20,
    saturation: -10,
    brightness: -2,
  },
  {
    id: 'vintage_cinema',
    name: 'Vintage Cinema',
    category: 'Cinematic',
    cssFilter: 'sepia(0.35) contrast(1.1) saturate(0.85) brightness(0.95)',
    contrast: 10,
    saturation: -15,
    brightness: -5,
  },

  // 11-15 Film
  {
    id: 'kodak_inspired',
    name: 'Kodak-inspired',
    category: 'Film',
    cssFilter: 'contrast(1.12) saturate(1.25) sepia(0.12) brightness(1.02)',
    temperature: 6200,
    contrast: 12,
    saturation: 25,
  },
  {
    id: 'fuji_inspired',
    name: 'Fuji-inspired',
    category: 'Film',
    cssFilter: 'contrast(1.15) saturate(1.1) hue-rotate(5deg) brightness(1.03)',
    temperature: 5200,
    contrast: 15,
    saturation: 10,
  },
  {
    id: 'classic_film',
    name: 'Classic Film',
    category: 'Film',
    cssFilter: 'contrast(1.08) saturate(0.88) brightness(1.0)',
    contrast: 8,
    saturation: -12,
  },
  {
    id: 'retro',
    name: 'Retro',
    category: 'Film',
    cssFilter: 'sepia(0.28) contrast(1.05) saturate(1.15) brightness(0.98)',
    contrast: 5,
    saturation: 15,
  },
  {
    id: 'grainy_film',
    name: 'Grainy Film',
    category: 'Film',
    cssFilter: 'contrast(1.22) saturate(0.82) brightness(1.0)',
    contrast: 22,
    saturation: -18,
  },

  // 16-20 Portrait
  {
    id: 'soft_portrait',
    name: 'Soft Portrait',
    category: 'Portrait',
    cssFilter: 'contrast(0.95) saturate(1.05) brightness(1.06)',
    contrast: -5,
    saturation: 5,
    brightness: 6,
  },
  {
    id: 'warm_portrait',
    name: 'Warm Portrait',
    category: 'Portrait',
    cssFilter: 'sepia(0.18) contrast(1.05) saturate(1.12) brightness(1.03)',
    temperature: 6400,
    contrast: 5,
    saturation: 12,
  },
  {
    id: 'cool_portrait',
    name: 'Cool Portrait',
    category: 'Portrait',
    cssFilter: 'hue-rotate(190deg) sepia(0.08) contrast(1.08) saturate(1.05)',
    temperature: 4600,
    contrast: 8,
    saturation: 5,
  },
  {
    id: 'skin_tone',
    name: 'Skin Tone',
    category: 'Portrait',
    cssFilter: 'contrast(1.06) saturate(1.15) brightness(1.04)',
    contrast: 6,
    saturation: 15,
    brightness: 4,
  },
  {
    id: 'studio_portrait',
    name: 'Studio Portrait',
    category: 'Portrait',
    cssFilter: 'contrast(1.22) saturate(1.08) brightness(1.02)',
    contrast: 22,
    saturation: 8,
    brightness: 2,
  },

  // 21-28 Creative
  {
    id: 'black_and_white',
    name: 'Black and White',
    category: 'Creative',
    cssFilter: 'grayscale(1) contrast(1.2)',
    contrast: 20,
    saturation: -100,
  },
  {
    id: 'dramatic',
    name: 'Dramatic',
    category: 'Creative',
    cssFilter: 'contrast(1.4) saturate(0.9) brightness(0.92)',
    contrast: 40,
    saturation: -10,
    brightness: -8,
  },
  {
    id: 'golden_hour',
    name: 'Golden Hour',
    category: 'Creative',
    cssFilter: 'sepia(0.38) contrast(1.12) saturate(1.3) brightness(1.05)',
    temperature: 7200,
    contrast: 12,
    saturation: 30,
    brightness: 5,
  },
  {
    id: 'sunset',
    name: 'Sunset',
    category: 'Creative',
    cssFilter: 'sepia(0.42) contrast(1.2) saturate(1.4) hue-rotate(-12deg)',
    temperature: 7800,
    contrast: 20,
    saturation: 40,
  },
  {
    id: 'night_glow',
    name: 'Night Glow',
    category: 'Creative',
    cssFilter: 'contrast(1.3) saturate(1.25) brightness(0.88) hue-rotate(200deg)',
    contrast: 30,
    saturation: 25,
    brightness: -12,
  },
  {
    id: 'monochrome_contrast',
    name: 'Monochrome Contrast',
    category: 'Creative',
    cssFilter: 'grayscale(1) contrast(1.6) brightness(0.95)',
    contrast: 60,
    saturation: -100,
    brightness: -5,
  },
  {
    id: 'dreamy',
    name: 'Dreamy',
    category: 'Creative',
    cssFilter: 'contrast(0.92) saturate(1.15) brightness(1.12) blur(0.3px)',
    contrast: -8,
    saturation: 15,
    brightness: 12,
  },
  {
    id: 'matte',
    name: 'Matte',
    category: 'Creative',
    cssFilter: 'contrast(0.85) brightness(1.08) saturate(0.9)',
    contrast: -15,
    saturation: -10,
    brightness: 8,
  },
];

/**
 * Computes 256-bin RGB and Luminance Histogram
 */
export function computeHistogram(data: Uint8ClampedArray): {
  r: Uint32Array;
  g: Uint32Array;
  b: Uint32Array;
  lum: Uint32Array;
  max: number;
} {
  const r = new Uint32Array(256);
  const g = new Uint32Array(256);
  const b = new Uint32Array(256);
  const lum = new Uint32Array(256);

  let maxVal = 0;
  const len = data.length;

  for (let i = 0; i < len; i += 8) {
    // Sample every 2nd pixel for performance
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];
    const y = Math.round(0.299 * red + 0.587 * green + 0.114 * blue);

    r[red]++;
    g[green]++;
    b[blue]++;
    lum[y]++;

    if (r[red] > maxVal) maxVal = r[red];
    if (g[green] > maxVal) maxVal = g[green];
    if (b[blue] > maxVal) maxVal = b[blue];
    if (lum[y] > maxVal) maxVal = lum[y];
  }

  return { r, g, b, lum, max: maxVal || 1 };
}

/**
 * Focus Peaking Edge Detection Overlay
 * Renders high-frequency edges in bright green (or amber)
 */
export function renderFocusPeaking(
  srcData: Uint8ClampedArray,
  targetCtx: CanvasRenderingContext2D,
  width: number,
  height: number,
  threshold: number = 32,
  color: 'green' | 'amber' = 'green'
): void {
  const overlayImage = targetCtx.createImageData(width, height);
  const out = overlayImage.data;
  const highlightR = color === 'amber' ? 255 : 0;
  const highlightG = color === 'amber' ? 180 : 255;
  const highlightB = 0;

  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      const idx = (y * width + x) * 4;

      const c = 0.299 * srcData[idx] + 0.587 * srcData[idx + 1] + 0.114 * srcData[idx + 2];
      const right = 0.299 * srcData[idx + 4] + 0.587 * srcData[idx + 5] + 0.114 * srcData[idx + 6];
      const bottom = 0.299 * srcData[idx + width * 4] + 0.587 * srcData[idx + width * 4 + 1] + 0.114 * srcData[idx + width * 4 + 2];

      const diff = Math.abs(c - right) + Math.abs(c - bottom);

      if (diff > threshold) {
        // Draw 2x2 highlight pixel
        for (let dy = 0; dy < 2; dy++) {
          for (let dx = 0; dx < 2; dx++) {
            const outIdx = ((y + dy) * width + (x + dx)) * 4;
            out[outIdx] = highlightR;
            out[outIdx + 1] = highlightG;
            out[outIdx + 2] = highlightB;
            out[outIdx + 3] = 230; // Bright opacity
          }
        }
      }
    }
  }

  targetCtx.putImageData(overlayImage, 0, 0);
}

/**
 * Zebra Clipping Highlight Overexposure Indicator
 * Renders diagonal diagonal stripes over pixels where luminance > 240
 */
export function renderZebraClipping(
  srcData: Uint8ClampedArray,
  targetCtx: CanvasRenderingContext2D,
  width: number,
  height: number,
  clippingThreshold: number = 242
): void {
  const overlayImage = targetCtx.createImageData(width, height);
  const out = overlayImage.data;

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const idx = (y * width + x) * 4;
      const lum = 0.299 * srcData[idx] + 0.587 * srcData[idx + 1] + 0.114 * srcData[idx + 2];

      if (lum >= clippingThreshold) {
        // Diagonal zebra stripe pattern (period = 8)
        const isStripe = (x + y) % 12 < 6;
        const outIdx = (y * width + x) * 4;
        if (isStripe) {
          out[outIdx] = 255;
          out[outIdx + 1] = 0;
          out[outIdx + 2] = 0;
          out[outIdx + 3] = 220; // Red stripe
        } else {
          out[outIdx] = 255;
          out[outIdx + 1] = 255;
          out[outIdx + 2] = 255;
          out[outIdx + 3] = 180; // White stripe
        }
      }
    }
  }

  targetCtx.putImageData(overlayImage, 0, 0);
}

/**
 * Color temperature Kelvin to approximate RGB scale
 */
export function kelvinToRgb(kelvin: number): { r: number; g: number; b: number } {
  const temp = Math.min(10000, Math.max(1000, kelvin)) / 100;
  let red = 0;
  let green = 0;
  let blue = 0;

  if (temp <= 66) {
    red = 255;
    green = Math.min(255, Math.max(0, 99.4708025861 * Math.log(temp) - 161.1195681661));
    blue = temp <= 19 ? 0 : Math.min(255, Math.max(0, 138.5177312231 * Math.log(temp - 10) - 305.0447927307));
  } else {
    red = Math.min(255, Math.max(0, 329.698727446 * Math.pow(temp - 60, -0.1332047592)));
    green = Math.min(255, Math.max(0, 288.1221695283 * Math.pow(temp - 60, -0.0755148492)));
    blue = 255;
  }

  return { r: red / 255, g: green / 255, b: blue / 255 };
}

/**
 * Convert shutter speed string/number to human readable label
 */
export function formatShutterSpeed(speed: number | 'auto'): string {
  if (speed === 'auto') return 'Auto';
  if (speed >= 1) return `${speed}s`;
  const denom = Math.round(1 / speed);
  return `1/${denom}s`;
}
