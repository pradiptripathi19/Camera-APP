import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateStarTrailLimit,
  stackFramesAverage,
  stackFramesMedian,
  stackFramesSigmaClipping,
  FramePixelData,
} from './stackingEngine';
import { CAMERA_FILTERS, formatShutterSpeed, kelvinToRgb } from './imageProcessing';
import { createDngFile } from './dngExporter';
import { REDMI_NOTE_15_4G_PROFILE } from './hardwareCapabilities';

test('calculateStarTrailLimit follows 500 Rule accurately', () => {
  // Redmi Note 15 4G main camera: 5.2mm physical lens * 4.6 crop factor = ~24mm eq
  const limit = calculateStarTrailLimit(5.2, 4.6);
  // 500 / 23.92 = ~20.9 seconds
  assert.ok(limit >= 19 && limit <= 22, `Expected limit ~21s, got ${limit}`);
});

test('stackFramesAverage correctly averages pixel intensities across frames', () => {
  const f1: FramePixelData = {
    width: 2,
    height: 1,
    data: new Uint8ClampedArray([100, 50, 20, 255, 200, 100, 40, 255]),
  };
  const f2: FramePixelData = {
    width: 2,
    height: 1,
    data: new Uint8ClampedArray([50, 150, 80, 255, 100, 100, 60, 255]),
  };

  const result = stackFramesAverage([f1, f2]);
  assert.equal(result.data[0], 75); // (100+50)/2
  assert.equal(result.data[1], 100); // (50+150)/2
  assert.equal(result.data[2], 50); // (20+80)/2
  assert.equal(result.data[3], 255); // Alpha
  assert.equal(result.data[4], 150); // (200+100)/2
});

test('stackFramesMedian rejects transient satellite / cosmic ray outlier spikes', () => {
  // 5 frames where frame 3 has a huge cosmic ray spike (255) while others are around 20
  const frames: FramePixelData[] = [
    { width: 1, height: 1, data: new Uint8ClampedArray([20, 20, 20, 255]) },
    { width: 1, height: 1, data: new Uint8ClampedArray([22, 22, 22, 255]) },
    { width: 1, height: 1, data: new Uint8ClampedArray([255, 255, 255, 255]) }, // Outlier
    { width: 1, height: 1, data: new Uint8ClampedArray([18, 18, 18, 255]) },
    { width: 1, height: 1, data: new Uint8ClampedArray([21, 21, 21, 255]) },
  ];

  const result = stackFramesMedian(frames);
  // Median of [18, 20, 21, 22, 255] is 21
  assert.equal(result.data[0], 21);
  assert.equal(result.data[1], 21);
  assert.equal(result.data[2], 21);
});

test('stackFramesSigmaClipping rejects statistical outliers and averages normal values', () => {
  // 5 frames with background noise around 30, and one outlier spike of 240
  const frames: FramePixelData[] = [
    { width: 1, height: 1, data: new Uint8ClampedArray([30, 30, 30, 255]) },
    { width: 1, height: 1, data: new Uint8ClampedArray([32, 32, 32, 255]) },
    { width: 1, height: 1, data: new Uint8ClampedArray([28, 28, 28, 255]) },
    { width: 1, height: 1, data: new Uint8ClampedArray([30, 30, 30, 255]) },
    { width: 1, height: 1, data: new Uint8ClampedArray([240, 240, 240, 255]) }, // Extreme outlier
  ];

  const result = stackFramesSigmaClipping(frames, 1.5);
  // The 240 value should be clipped out; mean of [30, 32, 28, 30] is 30
  assert.ok(result.data[0] < 50, `Expected clipped value < 50, got ${result.data[0]}`);
  assert.equal(result.data[0], 30);
});

test('createDngFile outputs a valid TIFF/DNG 1.4 header and tags', () => {
  const rawRgba = new Uint8ClampedArray([255, 128, 64, 255, 0, 100, 200, 255]);
  const dngBytes = createDngFile({
    width: 2,
    height: 1,
    rgbaData: rawRgba,
    cameraMake: 'Xiaomi',
    cameraModel: 'Redmi Note 15 4G',
    iso: 200,
  });

  // Check Little-endian TIFF header "II" (0x49 0x49)
  assert.equal(dngBytes[0], 0x49);
  assert.equal(dngBytes[1], 0x49);
  // Magic 42 (0x2A 0x00)
  assert.equal(dngBytes[2], 42);
  assert.equal(dngBytes[3], 0);

  // Check IFD0 offset at bytes 4-7 = 8
  const ifdOffset = dngBytes[4] | (dngBytes[5] << 8);
  assert.equal(ifdOffset, 8);

  // Buffer size must contain the 1024-byte header block plus 6 raw RGB bytes = 1030
  assert.equal(dngBytes.length, 1024 + 6);
  // Raw payload check at offset 1024
  assert.equal(dngBytes[1024], 255); // R
  assert.equal(dngBytes[1025], 128); // G
  assert.equal(dngBytes[1026], 64); // B
});

test('CAMERA_FILTERS has at least 25 professional filters across 5 categories', () => {
  assert.ok(CAMERA_FILTERS.length >= 25, `Expected >= 25 filters, got ${CAMERA_FILTERS.length}`);
  const categories = new Set(CAMERA_FILTERS.map((f) => f.category));
  assert.ok(categories.has('Natural'));
  assert.ok(categories.has('Cinematic'));
  assert.ok(categories.has('Film'));
  assert.ok(categories.has('Portrait'));
  assert.ok(categories.has('Creative'));
});

test('formatShutterSpeed formats fraction and seconds correctly', () => {
  assert.equal(formatShutterSpeed('auto'), 'Auto');
  assert.equal(formatShutterSpeed(1 / 1000), '1/1000s');
  assert.equal(formatShutterSpeed(1 / 60), '1/60s');
  assert.equal(formatShutterSpeed(2), '2s');
  assert.equal(formatShutterSpeed(30), '30s');
});

test('kelvinToRgb outputs valid normalized RGB range 0..1', () => {
  const warm = kelvinToRgb(3000);
  assert.ok(warm.r >= 0.9);
  assert.ok(warm.b < warm.r);

  const cool = kelvinToRgb(8000);
  assert.ok(cool.b >= 0.9);
});

test('REDMI_NOTE_15_4G_PROFILE accurately reflects Samsung ISOCELL HM6 sensor specs', () => {
  assert.equal(REDMI_NOTE_15_4G_PROFILE.mainSensor.name, 'Samsung ISOCELL HM6 (S5KHM6SX)');
  assert.ok(REDMI_NOTE_15_4G_PROFILE.mainSensor.rawResolution.includes('108 MP'));
  assert.ok(REDMI_NOTE_15_4G_PROFILE.mainSensor.binnedResolution.includes('12 MP'));
  assert.ok(REDMI_NOTE_15_4G_PROFILE.features.rawCapture);
});
