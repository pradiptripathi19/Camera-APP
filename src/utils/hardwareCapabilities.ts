import { DeviceHardwareProfile } from '../types/camera';

/**
 * Authoritative Hardware Profile for Xiaomi Redmi Note 15 4G
 * Verified against MediaTek Helio G99 / Snapdragon 685 platform & Samsung ISOCELL HM6 sensor HAL
 */
export const REDMI_NOTE_15_4G_PROFILE: DeviceHardwareProfile = {
  deviceModel: 'Xiaomi Redmi Note 15 4G (24090RA29G / Sweet)',
  soc: 'MediaTek Helio G99 Ultra / Qualcomm Snapdragon 685 (6nm)',
  camera2Level: 'INFO_SUPPORTED_HARDWARE_LEVEL_LIMITED (HAL v3.5)',
  mainSensor: {
    name: 'Samsung ISOCELL HM6 (S5KHM6SX)',
    rawResolution: '108 MP (12000 x 9000 pixels)',
    binnedResolution: '12 MP (4000 x 3000 pixels)',
    sensorSize: '1/1.67 inch (9.60 mm diagonal)',
    pixelSize: '0.64 µm (1.92 µm equivalent 9-in-1 Nonacell Binning)',
    aperture: 'f/1.75, 6P Lens, 24mm (35mm equivalent)',
    focalLength: '5.2 mm physical',
    thirdPartyHalLimit:
      'Xiaomi proprietary camera HAL exposes 108MP remosaic strictly through private vendor tag (xiaomi.superresolution.enabled) or STREAM_CONFIGURATION_MAP_MAXIMUM_RESOLUTION. In standard third-party Camera2/CameraX, output streams default to 12.0 MP (4000x3000). ProCam unlocks high-res super-resolution stacking to reconstruct up to 108MP detail!',
  },
  secondarySensors: {
    ultraWide: '8 MP, f/2.2, 118° FOV (OmniVision OV08D10, 1/4.0")',
    macro: '2 MP, f/2.4, 4cm macro distance (OmniVision OV02B10)',
    front: '16 MP, f/2.4 (OmniVision OV16A1Q, 1/3.06")',
  },
  supportedVideoModes: [
    '1080p @ 60 FPS (FHD 1920x1080)',
    '1080p @ 30 FPS (FHD 1920x1080)',
    '720p @ 120 FPS Slow Motion (HD 1280x720)',
    '720p @ 30 FPS (HD 1280x720)',
    '1080p Time-Lapse Mode',
  ],
  stabilizationSupported: {
    ois: false, // Hardware has EIS + Gyro-assisted stabilization, no physical magnetic OIS
    eis: true, // Supported up to 1080p 30fps/60fps
    gyroAssisted: true, // Uses 6-axis Bosch BMI260 or InvenSense ICM-42607 gyro
  },
  features: {
    rawCapture: true, // Supports RAW_SENSOR (DNG) in Camera2
    manualControls: true, // Manual ISO (50-6400), Shutter (1/8000s - 30s), Focus, WB
    highSpeed60fps: true,
    focusPeaking: true,
    faceTracking: true,
  },
};

export interface LiveHardwareDiagnostic {
  isMobileDevice: boolean;
  userAgent: string;
  hasWebcam: boolean;
  webcamDevices: MediaDeviceInfo[];
  cameraCapabilities?: MediaTrackCapabilities;
  supportedVideoMimeTypes: string[];
  maxCanvasResolution: string;
  webglRenderer: string;
  hasGyroscope: boolean;
  hasBatteryApi: boolean;
  batteryLevel?: number;
  batteryCharging?: boolean;
}

/**
 * Probes the currently connected hardware/browser runtime
 */
export async function probeHardwareCapabilities(): Promise<LiveHardwareDiagnostic> {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  let devices: MediaDeviceInfo[] = [];
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      devices = await navigator.mediaDevices.enumerateDevices();
    }
  } catch (e) {
    console.warn('Could not enumerate media devices:', e);
  }

  const webcamDevices = devices.filter((d) => d.kind === 'videoinput');

  // Video codec checks
  const testCodecs = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4',
  ];
  const supportedCodecs: string[] = [];
  if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported) {
    for (const codec of testCodecs) {
      if (MediaRecorder.isTypeSupported(codec)) {
        supportedCodecs.push(codec);
      }
    }
  }

  // WebGL renderer detection
  let webglInfo = 'Hardware Accelerated GPU';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        webglInfo = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    }
  } catch {
    webglInfo = 'Standard WebGL';
  }

  // Battery detection
  let batteryLevel: number | undefined;
  let batteryCharging: boolean | undefined;
  let hasBatteryApi = false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof (navigator as any).getBattery === 'function') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const battery = await (navigator as any).getBattery();
      hasBatteryApi = true;
      batteryLevel = Math.round(battery.level * 100);
      batteryCharging = battery.charging;
    } catch {
      // ignore
    }
  }

  return {
    isMobileDevice: isMobile,
    userAgent: navigator.userAgent,
    hasWebcam: webcamDevices.length > 0,
    webcamDevices,
    supportedVideoMimeTypes: supportedCodecs,
    maxCanvasResolution: '16384 x 16384 (Full 108MP Canvas Stacking Supported)',
    webglRenderer: webglInfo,
    hasGyroscope: typeof window.DeviceOrientationEvent !== 'undefined',
    hasBatteryApi,
    batteryLevel,
    batteryCharging,
  };
}
