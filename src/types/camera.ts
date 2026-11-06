export type CameraMode =
  | 'PHOTO'
  | 'VIDEO'
  | 'PRO'
  | 'NIGHT'
  | 'PORTRAIT'
  | 'ASTRO'
  | 'MOON'
  | 'PANORAMA'
  | 'SLOW_MO'
  | 'TIME_LAPSE';

export type AspectRatio = '4:3' | '16:9' | '1:1' | 'FULL';
export type FlashMode = 'off' | 'on' | 'auto' | 'torch';
export type HdrMode = 'off' | 'on' | 'auto';
export type TimerMode = 0 | 3 | 5 | 10;
export type MeteringMode = 'matrix' | 'center' | 'spot';

export interface ProSettings {
  iso: number | 'auto'; // 50 to 6400
  shutterSpeed: number | 'auto'; // in seconds, e.g. 1/8000 to 30
  focusDistance: number | 'auto'; // 0.0 (macro) to 1.0 (infinity)
  whiteBalance: number | 'auto'; // 2000K to 10000K
  exposureComp: number; // -3.0 to +3.0 EV
  metering: MeteringMode;
  focusPeaking: boolean;
  zebraClipping: boolean;
  histogram: boolean;
  format: 'jpeg' | 'png' | 'webp' | 'dng';
}

export type StackingAlgorithm =
  | 'average'
  | 'median'
  | 'sigma_clipping'
  | 'max_detail'
  | 'motion_aware';

export interface AstrophotographyConfig {
  frameCount: number; // 5, 10, 20, 30, 50, 100
  algorithm: StackingAlgorithm;
  sigmaThreshold: number; // 1.5 to 3.0
  darkFrameSubtraction: boolean;
  starAlignment: boolean;
  moonHighlightProtection: boolean;
  tripodGuidance: boolean;
  intervalSeconds: number;
}

export interface FilterPreset {
  id: string;
  name: string;
  category: 'Natural' | 'Cinematic' | 'Film' | 'Portrait' | 'Creative';
  cssFilter: string;
  temperature?: number;
  tint?: number;
  contrast?: number;
  saturation?: number;
  brightness?: number;
  sepia?: number;
  vignette?: boolean;
}

export interface ExifMetadata {
  cameraMake: string;
  cameraModel: string;
  sensor: string;
  lens: string;
  megapixels: string;
  iso: number;
  shutterSpeed: string;
  aperture: string;
  focalLength: string;
  exposureCompensation: string;
  whiteBalance: string;
  date: string;
  format: string;
  resolution: string;
  orientation?: number;
  gps?: {
    latitude: number;
    longitude: number;
  };
  stackingInfo?: {
    frames: number;
    algorithm: string;
  };
}

export interface CapturedMedia {
  id: string;
  type: 'photo' | 'video';
  url: string; // Data URL or Blob URL
  rawUrl?: string; // Optional DNG or unedited backup
  timestamp: number;
  format: string;
  width: number;
  height: number;
  duration?: number;
  exif: ExifMetadata;
  filterApplied?: string;
  isFavorite?: boolean;
}

export interface DeviceHardwareProfile {
  deviceModel: string;
  soc: string;
  camera2Level: string;
  mainSensor: {
    name: string;
    rawResolution: string; // e.g. "108 MP (12000 x 9000)"
    binnedResolution: string; // "12 MP (4000 x 3000)"
    sensorSize: string; // "1/1.67 inch"
    pixelSize: string; // "0.64 µm (1.92 µm 9-in-1 Nonacell)"
    aperture: string; // "f/1.75"
    focalLength: string; // "24mm eq"
    thirdPartyHalLimit: string;
  };
  secondarySensors: {
    ultraWide: string;
    macro: string;
    front: string;
  };
  supportedVideoModes: string[];
  stabilizationSupported: {
    ois: boolean;
    eis: boolean;
    gyroAssisted: boolean;
  };
  features: {
    rawCapture: boolean;
    manualControls: boolean;
    highSpeed60fps: boolean;
    focusPeaking: boolean;
    faceTracking: boolean;
  };
}
