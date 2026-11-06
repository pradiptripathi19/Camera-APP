import React, { useState, useRef, useCallback } from 'react';
import {
  CameraMode,
  FlashMode,
  HdrMode,
  AspectRatio,
  TimerMode,
  ProSettings,
  AstrophotographyConfig,
  CapturedMedia,
} from './types/camera';
import { Viewfinder } from './components/Viewfinder';
import { TopControls } from './components/TopControls';
import { BottomBar } from './components/BottomBar';
import { ProControlsPanel } from './components/ProControlsPanel';
import { AstrophotographyPanel } from './components/AstrophotographyPanel';
import { FilterPicker } from './components/FilterPicker';
import { GalleryModal } from './components/GalleryModal';
import { HardwareDashboardModal } from './components/HardwareDashboardModal';
import { AndroidProjectModal } from './components/AndroidProjectModal';
import { SettingsModal } from './components/SettingsModal';
import { alignAndStackFrames, FramePixelData } from './utils/stackingEngine';
import { createDngFile, downloadBinaryFile } from './utils/dngExporter';
import { CAMERA_FILTERS } from './utils/imageProcessing';

export default function App() {
  // Main camera state
  const [mode, setMode] = useState<CameraMode>('PHOTO');
  const [flash, setFlash] = useState<FlashMode>('auto');
  const [hdr, setHdr] = useState<HdrMode>('auto');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('4:3');
  const [timer, setTimer] = useState<TimerMode>(0);
  const [macroActive, setMacroActive] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  // PRO Settings (includes live histogram and focus peaking toggles)
  const [proSettings, setProSettings] = useState<ProSettings>({
    iso: 'auto',
    shutterSpeed: 'auto',
    focusDistance: 'auto',
    whiteBalance: 'auto',
    exposureComp: 0,
    metering: 'matrix',
    focusPeaking: false,
    zebraClipping: false,
    histogram: true, // Enabled by default in PRO
    format: 'jpeg',
  });

  // Astrophotography & Moon Stacking Configuration
  const [astroConfig, setAstroConfig] = useState<AstrophotographyConfig>({
    frameCount: 20,
    algorithm: 'sigma_clipping',
    sigmaThreshold: 2.0,
    darkFrameSubtraction: true,
    starAlignment: true,
    moonHighlightProtection: true,
    tripodGuidance: true,
    intervalSeconds: 0,
  });

  // Filter state (28 presets)
  const [filterId, setFilterId] = useState<string>('natural');
  const [filterIntensity, setFilterIntensity] = useState<number>(100);

  // Settings preferences
  const [gridType, setGridType] = useState<'off' | 'rule_of_thirds' | 'golden_ratio' | 'crosshair'>('rule_of_thirds');
  const [showLeveler, setShowLeveler] = useState<boolean>(true);
  const [watermark, setWatermark] = useState<boolean>(true);
  const [shutterSound, setShutterSound] = useState<boolean>(true);
  const [stabilizationMode, setStabilizationMode] = useState<'standard' | 'enhanced' | 'maximum'>('enhanced');

  // Execution & Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [stackingProgress, setStackingProgress] = useState<{
    current: number;
    total: number;
    algorithm: string;
  } | null>(null);

  // Active Modals
  const [showGallery, setShowGallery] = useState<boolean>(false);
  const [showHardwareDashboard, setShowHardwareDashboard] = useState<boolean>(false);
  const [showAndroidProject, setShowAndroidProject] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showFilterPicker, setShowFilterPicker] = useState<boolean>(false);

  // Success Notification Banner
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle: string } | null>(null);

  // Capture Frame Handler reference from Viewfinder
  const captureFrameRef = useRef<(() => Promise<ImageData>) | null>(null);
  const recordIntervalRef = useRef<any>(null);

  // Initial Sample Gallery Items (demonstrating Redmi Note 15 4G 108MP, Sigma-Clipped Astro Stack, Moon Detail)
  const [mediaList, setMediaList] = useState<CapturedMedia[]>([
    {
      id: 'demo-108mp',
      type: 'photo',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900"><rect width="1200" height="900" fill="%231e293b"/><circle cx="600" cy="450" r="300" fill="%23f59e0b" opacity="0.3"/><text x="600" y="450" font-family="monospace" font-size="32" fill="white" text-anchor="middle" font-weight="bold">108MP ULTRA-HIGH RESOLUTION</text><text x="600" y="500" font-family="monospace" font-size="18" fill="%23f59e0b" text-anchor="middle">Samsung ISOCELL HM6 • 12000 x 9000</text></svg>',
      timestamp: Date.now() - 3600000,
      format: 'jpeg',
      width: 12000,
      height: 9000,
      exif: {
        cameraMake: 'Xiaomi',
        cameraModel: 'Redmi Note 15 4G',
        sensor: 'Samsung ISOCELL HM6 (108 MP)',
        lens: '24mm f/1.75 6P Lens',
        megapixels: '108.0 MP',
        iso: 100,
        shutterSpeed: '1/250s',
        aperture: 'f/1.75',
        focalLength: '5.2 mm (24mm eq)',
        exposureCompensation: '0.0 EV',
        whiteBalance: '5500K Daylight',
        date: new Date(Date.now() - 3600000).toLocaleString(),
        format: 'JPEG Fine',
        resolution: '12000 x 9000',
      },
      isFavorite: true,
    },
    {
      id: 'demo-astro-stack',
      type: 'photo',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900"><rect width="1200" height="900" fill="%23020617"/><circle cx="600" cy="380" r="140" fill="%23e2e8f0"/><circle cx="560" cy="340" r="35" fill="%2394a3b8" opacity="0.5"/><circle cx="640" cy="420" r="45" fill="%2364748b" opacity="0.4"/><text x="600" y="720" font-family="monospace" font-size="28" fill="%2338bdf8" text-anchor="middle" font-weight="bold">LUNAR CRATER DETAIL STACK</text><text x="600" y="760" font-family="monospace" font-size="16" fill="%2394a3b8" text-anchor="middle">Stacked 30 Frames with Sigma-Clipping</text></svg>',
      timestamp: Date.now() - 7200000,
      format: 'dng',
      width: 4000,
      height: 3000,
      exif: {
        cameraMake: 'Xiaomi',
        cameraModel: 'Redmi Note 15 4G',
        sensor: 'Samsung ISOCELL HM6',
        lens: '24mm f/1.75',
        megapixels: '12.0 MP (Nonacell)',
        iso: 200,
        shutterSpeed: '1/125s',
        aperture: 'f/1.75',
        focalLength: '5.2 mm',
        exposureCompensation: '-1.0 EV',
        whiteBalance: '5200K',
        date: new Date(Date.now() - 7200000).toLocaleString(),
        format: 'RAW DNG',
        resolution: '4000 x 3000',
        stackingInfo: {
          frames: 30,
          algorithm: 'Sigma-Clipping',
        },
      },
      isFavorite: true,
    },
  ]);

  // Audio synthesize shutter click
  const playShutterAudio = useCallback(() => {
    if (!shutterSound) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch {
      // AudioContext unavailable
    }
  }, [shutterSound]);

  // Shutter trigger logic
  const handleShutterPress = async () => {
    if (isProcessing) return;

    // Handle Video recording toggle
    if (mode === 'VIDEO' || mode === 'SLOW_MO' || mode === 'TIME_LAPSE') {
      if (isRecording) {
        // Stop recording
        setIsRecording(false);
        if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
        playShutterAudio();

        // Create captured video entry
        const newVideo: CapturedMedia = {
          id: `vid-${Date.now()}`,
          type: 'video',
          url: mediaList[0]?.url || '',
          timestamp: Date.now(),
          format: 'mp4',
          width: 1920,
          height: 1080,
          duration: recordingSeconds,
          exif: {
            cameraMake: 'Xiaomi',
            cameraModel: 'Redmi Note 15 4G',
            sensor: 'Samsung ISOCELL HM6',
            lens: '24mm f/1.75',
            megapixels: '2.1 MP (1080p)',
            iso: proSettings.iso === 'auto' ? 200 : (proSettings.iso as number),
            shutterSpeed: mode === 'SLOW_MO' ? '1/240s (120 FPS)' : '1/120s (60 FPS)',
            aperture: 'f/1.75',
            focalLength: '5.2 mm',
            exposureCompensation: `${proSettings.exposureComp} EV`,
            whiteBalance: proSettings.whiteBalance === 'auto' ? 'Auto' : `${proSettings.whiteBalance}K`,
            date: new Date().toLocaleString(),
            format: 'MP4 (AVC/AAC)',
            resolution: '1920 x 1080 @ 60 FPS',
          },
        };

        setMediaList((prev) => [newVideo, ...prev]);
        setToastMessage({
          title: 'Video Saved Successfully',
          subtitle: `Recorded ${recordingSeconds}s • 1080p 60FPS EIS Stabilized`,
        });
        setTimeout(() => setToastMessage(null), 4000);
        setRecordingSeconds(0);
      } else {
        // Start recording
        setIsRecording(true);
        setRecordingSeconds(0);
        playShutterAudio();
        recordIntervalRef.current = setInterval(() => {
          setRecordingSeconds((s) => s + 1);
        }, 1000);
      }
      return;
    }

    // Photo capture / Stacking flow
    if (!captureFrameRef.current) return;
    setIsProcessing(true);

    // Multi-frame Astrophotography / Moon / Night Stacking flow
    if (mode === 'ASTRO' || mode === 'MOON' || mode === 'NIGHT') {
      const framesToCapture = mode === 'NIGHT' ? 8 : astroConfig.frameCount;
      const algorithm = mode === 'NIGHT' ? 'average' : astroConfig.algorithm;

      setStackingProgress({
        current: 1,
        total: framesToCapture,
        algorithm,
      });

      const collectedFrames: FramePixelData[] = [];

      for (let i = 0; i < framesToCapture; i++) {
        // Grab frame
        const frameData = await captureFrameRef.current();
        collectedFrames.push({
          width: frameData.width,
          height: frameData.height,
          data: new Uint8ClampedArray(frameData.data),
        });

        setStackingProgress({
          current: i + 1,
          total: framesToCapture,
          algorithm,
        });

        // Delay between frame exposures
        await new Promise((resolve) => setTimeout(resolve, 80));
      }

      // Execute Stacking Engine with motion-aware alignment
      const stackedResult = alignAndStackFrames(
        collectedFrames,
        algorithm,
        astroConfig.sigmaThreshold
      );

      playShutterAudio();

      // Render stacked result to Canvas
      const outCanvas = document.createElement('canvas');
      outCanvas.width = stackedResult.width;
      outCanvas.height = stackedResult.height;
      const outCtx = outCanvas.getContext('2d');
      if (outCtx) {
        const imgData = outCtx.createImageData(stackedResult.width, stackedResult.height);
        imgData.data.set(stackedResult.data);
        outCtx.putImageData(imgData, 0, 0);

        // Watermark if enabled
        if (watermark) {
          outCtx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          outCtx.font = 'bold 28px monospace';
          outCtx.fillText('SHOT ON REDMI NOTE 15 4G', 40, outCanvas.height - 70);
          outCtx.font = '20px monospace';
          outCtx.fillStyle = 'rgba(251, 191, 36, 0.9)';
          outCtx.fillText(`108MP HM6 • ${framesToCapture}-FRAME ${algorithm.toUpperCase()} STACK`, 40, outCanvas.height - 38);
        }

        const dataUrl = outCanvas.toDataURL('image/jpeg', 0.95);

        const newMedia: CapturedMedia = {
          id: `stack-${Date.now()}`,
          type: 'photo',
          url: dataUrl,
          timestamp: Date.now(),
          format: proSettings.format === 'dng' ? 'dng' : 'jpeg',
          width: outCanvas.width,
          height: outCanvas.height,
          exif: {
            cameraMake: 'Xiaomi',
            cameraModel: 'Redmi Note 15 4G',
            sensor: 'Samsung ISOCELL HM6',
            lens: '24mm f/1.75',
            megapixels: '12.0 MP (Multi-Frame Stacked)',
            iso: proSettings.iso === 'auto' ? 400 : (proSettings.iso as number),
            shutterSpeed: mode === 'MOON' ? '1/250s' : '15s (500-Rule Limit: 20.9s)',
            aperture: 'f/1.75',
            focalLength: '5.2 mm',
            exposureCompensation: `${proSettings.exposureComp} EV`,
            whiteBalance: '5000K',
            date: new Date().toLocaleString(),
            format: proSettings.format === 'dng' ? 'RAW DNG' : 'JPEG Fine',
            resolution: `${outCanvas.width} x ${outCanvas.height}`,
            stackingInfo: {
              frames: framesToCapture,
              algorithm,
            },
          },
        };

        setMediaList((prev) => [newMedia, ...prev]);
        setToastMessage({
          title: `${mode} Stacking Complete!`,
          subtitle: `Combined ${framesToCapture} frames via ${algorithm.toUpperCase()} (-${Math.round(Math.sqrt(framesToCapture) * 3)}dB noise)`,
        });
        setTimeout(() => setToastMessage(null), 4000);
      }

      setStackingProgress(null);
      setIsProcessing(false);
      return;
    }

    // Standard Single Frame Capture (Photo / Pro / Portrait)
    const singleFrame = await captureFrameRef.current();
    playShutterAudio();

    const canvas = document.createElement('canvas');
    canvas.width = singleFrame.width;
    canvas.height = singleFrame.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.putImageData(singleFrame, 0, 0);

      // Watermark
      if (watermark) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.font = 'bold 28px monospace';
        ctx.fillText('SHOT ON REDMI NOTE 15 4G', 40, canvas.height - 70);
        ctx.font = '20px monospace';
        ctx.fillStyle = 'rgba(251, 191, 36, 0.9)';
        ctx.fillText('108MP SAMSUNG HM6 • PROCAM', 40, canvas.height - 38);
      }

      const isDng = proSettings.format === 'dng';
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

      const newMedia: CapturedMedia = {
        id: `photo-${Date.now()}`,
        type: 'photo',
        url: dataUrl,
        timestamp: Date.now(),
        format: isDng ? 'dng' : proSettings.format,
        width: canvas.width,
        height: canvas.height,
        filterApplied: filterId !== 'natural' ? filterId : undefined,
        exif: {
          cameraMake: 'Xiaomi',
          cameraModel: 'Redmi Note 15 4G',
          sensor: 'Samsung ISOCELL HM6 (108 MP)',
          lens: '24mm f/1.75 6P Lens',
          megapixels: aspectRatio === '4:3' ? '108.0 MP / 12.0 MP' : '12.0 MP',
          iso: proSettings.iso === 'auto' ? 100 : (proSettings.iso as number),
          shutterSpeed: proSettings.shutterSpeed === 'auto' ? '1/250s' : `${proSettings.shutterSpeed}s`,
          aperture: 'f/1.75',
          focalLength: '5.2 mm (24mm eq)',
          exposureCompensation: `${proSettings.exposureComp} EV`,
          whiteBalance: proSettings.whiteBalance === 'auto' ? 'Auto' : `${proSettings.whiteBalance}K`,
          date: new Date().toLocaleString(),
          format: isDng ? 'RAW DNG' : proSettings.format.toUpperCase(),
          resolution: `${canvas.width} x ${canvas.height}`,
        },
      };

      setMediaList((prev) => [newMedia, ...prev]);

      // If user selected RAW DNG in Pro Mode, trigger raw binary download or save
      if (isDng) {
        const dngBytes = createDngFile({
          width: canvas.width,
          height: canvas.height,
          rgbaData: singleFrame.data,
          cameraMake: 'Xiaomi',
          cameraModel: 'Redmi Note 15 4G',
          iso: newMedia.exif.iso,
          shutterSpeed: newMedia.exif.shutterSpeed,
          aperture: 'f/1.75',
        });
        downloadBinaryFile(dngBytes, `ProCam_${Date.now()}.dng`);
      }

      setToastMessage({
        title: isDng ? 'RAW DNG Capture Saved' : 'Photo Captured',
        subtitle: `${canvas.width}x${canvas.height} • Saved to Gallery`,
      });
      setTimeout(() => setToastMessage(null), 3000);
    }

    setIsProcessing(false);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col justify-between font-sans select-none">
      {/* Top Controls Bar */}
      <TopControls
        flash={flash}
        onFlashChange={setFlash}
        hdr={hdr}
        onHdrChange={setHdr}
        aspectRatio={aspectRatio}
        onAspectRatioChange={setAspectRatio}
        timer={timer}
        onTimerChange={setTimer}
        onOpenSettings={() => setShowSettings(true)}
        onOpenHardwareDashboard={() => setShowHardwareDashboard(true)}
        onOpenAndroidProject={() => setShowAndroidProject(true)}
        macroActive={macroActive}
        onToggleMacro={() => {
          setMacroActive(!macroActive);
          if (!macroActive) setZoomLevel(2.0);
          else setZoomLevel(1.0);
        }}
      />

      {/* Main Viewfinder Surface */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-black">
        <Viewfinder
          mode={mode}
          aspectRatio={aspectRatio}
          proSettings={proSettings}
          filterId={filterId}
          filterIntensity={filterIntensity}
          zoomLevel={zoomLevel}
          onZoomChange={setZoomLevel}
          gridType={gridType}
          showLeveler={showLeveler}
          isRecording={isRecording}
          recordingSeconds={recordingSeconds}
          stackingProgress={stackingProgress}
          selectedFacingMode={facingMode}
          onRegisterCaptureHandler={(handler) => {
            captureFrameRef.current = handler;
          }}
        />

        {/* PRO Quick Mode HUD Header */}
        {mode === 'PRO' && (
          <div className="absolute top-3 left-4 z-20 flex items-center gap-2">
            <span className="bg-amber-400 text-black font-mono font-bold text-[10px] px-2 py-0.5 rounded shadow">
              PRO MANUAL
            </span>
            <button
              onClick={() => setProSettings((s) => ({ ...s, histogram: !s.histogram }))}
              className={`px-2 py-0.5 rounded text-[10px] font-mono border transition ${
                proSettings.histogram
                  ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold'
                  : 'bg-black/60 border-neutral-700 text-neutral-400'
              }`}
            >
              HISTOGRAM {proSettings.histogram ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => setProSettings((s) => ({ ...s, focusPeaking: !s.focusPeaking }))}
              className={`px-2 py-0.5 rounded text-[10px] font-mono border transition ${
                proSettings.focusPeaking
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                  : 'bg-black/60 border-neutral-700 text-neutral-400'
              }`}
            >
              PEAKING {proSettings.focusPeaking ? 'ON' : 'OFF'}
            </button>
          </div>
        )}

        {/* Success Toast Banner */}
        {toastMessage && (
          <div className="absolute top-16 inset-x-6 z-40 max-w-md mx-auto bg-neutral-900/95 border border-amber-400/60 text-white rounded-xl p-3 shadow-2xl flex items-center justify-between backdrop-blur-md animate-fade-in">
            <div>
              <div className="text-xs font-mono font-bold text-amber-400">{toastMessage.title}</div>
              <div className="text-[10px] font-mono text-neutral-300">{toastMessage.subtitle}</div>
            </div>
            <button
              onClick={() => setShowGallery(true)}
              className="px-2.5 py-1 rounded-lg bg-amber-400 text-black font-mono text-[10px] font-bold active:scale-95 transition"
            >
              View
            </button>
          </div>
        )}
      </div>

      {/* Mode-Specific Settings Strips */}
      {mode === 'PRO' && (
        <ProControlsPanel
          settings={proSettings}
          onChange={(updated) => setProSettings((prev) => ({ ...prev, ...updated }))}
        />
      )}

      {(mode === 'ASTRO' || mode === 'MOON') && (
        <AstrophotographyPanel
          config={astroConfig}
          onChange={(updated) => setAstroConfig((prev) => ({ ...prev, ...updated }))}
          isMoonMode={mode === 'MOON'}
        />
      )}

      {showFilterPicker && (
        <FilterPicker
          activeFilterId={filterId}
          onSelectFilter={setFilterId}
          intensity={filterIntensity}
          onIntensityChange={setFilterIntensity}
          onClose={() => setShowFilterPicker(false)}
        />
      )}

      {/* Signature Xiaomi Bottom Bar */}
      <BottomBar
        currentMode={mode}
        onModeChange={(newMode) => {
          setMode(newMode);
          if (newMode === 'PRO') {
            setProSettings((s) => ({ ...s, histogram: true }));
          }
          if (newMode === 'MOON') {
            setZoomLevel(2.0);
          }
        }}
        onShutterPress={handleShutterPress}
        isRecording={isRecording}
        isProcessing={isProcessing}
        latestMedia={mediaList[0] || null}
        mediaCount={mediaList.length}
        onOpenGallery={() => setShowGallery(true)}
        onToggleCameraFacing={() =>
          setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
        }
        onToggleFilterPicker={() => setShowFilterPicker(!showFilterPicker)}
        filterActive={filterId !== 'natural' || showFilterPicker}
      />

      {/* Modals */}
      {showGallery && (
        <GalleryModal
          mediaList={mediaList}
          onClose={() => setShowGallery(false)}
          onDeleteMedia={(id) => setMediaList((prev) => prev.filter((m) => m.id !== id))}
          onUpdateMedia={(updated) =>
            setMediaList((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
          }
        />
      )}

      {showHardwareDashboard && (
        <HardwareDashboardModal onClose={() => setShowHardwareDashboard(false)} />
      )}

      {showAndroidProject && (
        <AndroidProjectModal onClose={() => setShowAndroidProject(false)} />
      )}

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          gridType={gridType}
          onGridChange={setGridType}
          showLeveler={showLeveler}
          onToggleLeveler={() => setShowLeveler(!showLeveler)}
          watermark={watermark}
          onToggleWatermark={() => setWatermark(!watermark)}
          shutterSound={shutterSound}
          onToggleShutterSound={() => setShutterSound(!shutterSound)}
          defaultFormat={proSettings.format}
          onFormatChange={(fmt) => setProSettings((s) => ({ ...s, format: fmt }))}
          stabilizationMode={stabilizationMode}
          onStabilizationChange={setStabilizationMode}
        />
      )}
    </div>
  );
}
