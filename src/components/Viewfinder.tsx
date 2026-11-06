import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CameraMode, AspectRatio, ProSettings } from '../types/camera';
import {
  computeHistogram,
  renderFocusPeaking,
  renderZebraClipping,
  CAMERA_FILTERS,
} from '../utils/imageProcessing';

interface ViewfinderProps {
  mode: CameraMode;
  aspectRatio: AspectRatio;
  proSettings: ProSettings;
  filterId: string;
  filterIntensity: number; // 0 to 100
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  gridType: 'off' | 'rule_of_thirds' | 'golden_ratio' | 'crosshair';
  showLeveler: boolean;
  isRecording: boolean;
  recordingSeconds: number;
  stackingProgress: { current: number; total: number; algorithm: string } | null;
  onRegisterCaptureHandler: (handler: () => Promise<ImageData>) => void;
  selectedFacingMode: 'user' | 'environment';
}

export const Viewfinder: React.FC<ViewfinderProps> = ({
  mode,
  aspectRatio,
  proSettings,
  filterId,
  filterIntensity,
  zoomLevel,
  onZoomChange,
  gridType,
  showLeveler,
  isRecording,
  recordingSeconds,
  stackingProgress,
  onRegisterCaptureHandler,
  selectedFacingMode,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const histogramCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [usingSyntheticFeed, setUsingSyntheticFeed] = useState(false);
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null);
  const [facePosition, setFacePosition] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [tiltRoll, setTiltRoll] = useState<number>(0);
  const [isLevel, setIsLevel] = useState(false);
  const [vuLevel, setVuLevel] = useState<number>(0.2);

  // Initialize camera stream
  useEffect(() => {
    let stream: MediaStream | null = null;
    let isMounted = true;

    async function initCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('getUserMedia not supported in this environment');
        }

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: selectedFacingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: mode === 'VIDEO' || mode === 'SLOW_MO',
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (isMounted && videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
          setUsingSyntheticFeed(false);
        }
      } catch (err) {
        console.warn('Real camera not accessible, falling back to high-fidelity sensor simulator:', err);
        if (isMounted) {
          setUsingSyntheticFeed(true);
        }
      }
    }

    initCamera();

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [selectedFacingMode, mode]);

  // Synthetic camera sensor generator (when real camera is unavailable/denied)
  useEffect(() => {
    if (!usingSyntheticFeed) return;

    let animId: number;
    let frameCounter = 0;
    const canvas = streamCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1280;
    canvas.height = 720;

    const renderSyntheticScene = () => {
      frameCounter++;
      const time = frameCounter * 0.02;

      // Render based on mode
      if (mode === 'ASTRO') {
        // Deep Night Sky with Milky Way & Stars
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, '#02030a');
        grad.addColorStop(0.5, '#070b19');
        grad.addColorStop(1, '#0c0f24');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Milky Way dust band
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-0.35);
        const mwGrad = ctx.createLinearGradient(-canvas.width, -100, canvas.width, 100);
        mwGrad.addColorStop(0, 'rgba(80, 70, 140, 0.0)');
        mwGrad.addColorStop(0.3, 'rgba(160, 140, 210, 0.15)');
        mwGrad.addColorStop(0.5, 'rgba(230, 210, 255, 0.28)');
        mwGrad.addColorStop(0.7, 'rgba(140, 120, 190, 0.14)');
        mwGrad.addColorStop(1, 'rgba(60, 50, 110, 0.0)');
        ctx.fillStyle = mwGrad;
        ctx.fillRect(-canvas.width, -120, canvas.width * 2, 240);
        ctx.restore();

        // Stars
        for (let i = 0; i < 90; i++) {
          const sx = ((i * 137.5) % canvas.width);
          const sy = ((i * 219.3) % (canvas.height * 0.85));
          const brightness = (Math.sin(time * 2 + i) * 0.3 + 0.7);
          const r = (i % 7 === 0) ? 2.2 : 1.2;

          ctx.fillStyle = (i % 5 === 0) ? `rgba(255, 220, 180, ${brightness})` : `rgba(220, 240, 255, ${brightness})`;
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fill();
        }

        // Mountain horizon silhouette
        ctx.fillStyle = '#010205';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        ctx.lineTo(0, canvas.height * 0.82);
        ctx.lineTo(canvas.width * 0.25, canvas.height * 0.76);
        ctx.lineTo(canvas.width * 0.5, canvas.height * 0.84);
        ctx.lineTo(canvas.width * 0.75, canvas.height * 0.72);
        ctx.lineTo(canvas.width, canvas.height * 0.8);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();

      } else if (mode === 'MOON') {
        // High contrast lunar photography scene
        ctx.fillStyle = '#020204';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Stars very dim to avoid overexposure
        for (let i = 0; i < 25; i++) {
          const sx = ((i * 179) % canvas.width);
          const sy = ((i * 231) % canvas.height);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fillRect(sx, sy, 1.2, 1.2);
        }

        // Detailed Moon Sphere
        const mx = canvas.width / 2;
        const my = canvas.height / 2;
        const moonRadius = 130 * Math.min(3, Math.max(1, zoomLevel * 0.8));

        // Soft lunar glow
        const glow = ctx.createRadialGradient(mx, my, moonRadius * 0.8, mx, my, moonRadius * 1.5);
        glow.addColorStop(0, 'rgba(240, 245, 255, 0.2)');
        glow.addColorStop(1, 'rgba(240, 245, 255, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(mx, my, moonRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Moon disc
        const moonGrad = ctx.createRadialGradient(mx - moonRadius * 0.3, my - moonRadius * 0.3, 10, mx, my, moonRadius);
        moonGrad.addColorStop(0, '#fefefe');
        moonGrad.addColorStop(0.7, '#e4e7ea');
        moonGrad.addColorStop(1, '#9da3a8');
        ctx.fillStyle = moonGrad;
        ctx.beginPath();
        ctx.arc(mx, my, moonRadius, 0, Math.PI * 2);
        ctx.fill();

        // Lunar Maria (dark basalt plains) & craters
        ctx.fillStyle = 'rgba(70, 75, 82, 0.42)';
        ctx.beginPath();
        ctx.ellipse(mx - moonRadius * 0.25, my - moonRadius * 0.2, moonRadius * 0.35, moonRadius * 0.25, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(mx + moonRadius * 0.2, my + moonRadius * 0.1, moonRadius * 0.3, moonRadius * 0.28, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(mx - moonRadius * 0.1, my + moonRadius * 0.35, moonRadius * 0.22, moonRadius * 0.18, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Tycho crater ray system
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mx - moonRadius * 0.15, my + moonRadius * 0.5, 6, 0, Math.PI * 2);
        ctx.stroke();

      } else if (mode === 'PORTRAIT') {
        // Studio Portrait Backdrop with warm bokeh lights
        const bgGrad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 80, canvas.width / 2, canvas.height / 2, canvas.width * 0.7);
        bgGrad.addColorStop(0, '#3a2d2a');
        bgGrad.addColorStop(0.5, '#221a18');
        bgGrad.addColorStop(1, '#110c0b');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Bokeh spheres
        for (let i = 0; i < 8; i++) {
          const bx = ((i * 180 + time * 10) % canvas.width);
          const by = (i * 90) % (canvas.height * 0.7) + 50;
          const br = 45 + (i % 3) * 20;
          ctx.fillStyle = `rgba(255, 190, 140, 0.12)`;
          ctx.beginPath();
          ctx.arc(bx, by, br, 0, Math.PI * 2);
          ctx.fill();
        }

        // Portrait subject silhouette / head
        const px = canvas.width / 2 + Math.sin(time * 0.8) * 12;
        const py = canvas.height * 0.42;

        // Head & Shoulders
        ctx.fillStyle = '#1c1514';
        ctx.beginPath();
        ctx.arc(px, py, 95, 0, Math.PI * 2);
        ctx.fill();

        // Face tone
        ctx.fillStyle = '#c7927d';
        ctx.beginPath();
        ctx.ellipse(px, py + 10, 68, 80, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = '#261b18';
        ctx.beginPath();
        ctx.arc(px, py - 20, 78, Math.PI * 0.9, Math.PI * 2.1);
        ctx.fill();

        // Eyes & smile
        ctx.fillStyle = '#422c24';
        ctx.beginPath();
        ctx.arc(px - 25, py + 5, 6, 0, Math.PI * 2);
        ctx.arc(px + 25, py + 5, 6, 0, Math.PI * 2);
        ctx.fill();

        // Shoulders
        ctx.fillStyle = '#202428';
        ctx.beginPath();
        ctx.ellipse(px, canvas.height * 0.88, 220, 140, 0, 0, Math.PI * 2);
        ctx.fill();

        // Update face position for reticle
        setFacePosition({
          x: px - 70,
          y: py - 70,
          w: 140,
          h: 150,
        });

      } else {
        // PHOTO / VIDEO / PRO / NIGHT: Scenic Landscape
        const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.65);
        if (mode === 'NIGHT') {
          skyGrad.addColorStop(0, '#040714');
          skyGrad.addColorStop(0.7, '#0b162c');
          skyGrad.addColorStop(1, '#1b2c4c');
        } else {
          // Warm Golden Hour Sky
          skyGrad.addColorStop(0, '#2d5a88');
          skyGrad.addColorStop(0.5, '#7692ab');
          skyGrad.addColorStop(0.85, '#e29a65');
          skyGrad.addColorStop(1, '#f7c58d');
        }
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height * 0.65);

        // Sun / Moon in sky
        if (mode !== 'NIGHT') {
          const sunX = canvas.width * 0.72;
          const sunY = canvas.height * 0.38;
          const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 100);
          sunGrad.addColorStop(0, '#ffffff');
          sunGrad.addColorStop(0.2, '#ffe6a3');
          sunGrad.addColorStop(1, 'rgba(255, 200, 100, 0)');
          ctx.fillStyle = sunGrad;
          ctx.beginPath();
          ctx.arc(sunX, sunY, 100, 0, Math.PI * 2);
          ctx.fill();
        }

        // Distant Mountains
        ctx.fillStyle = mode === 'NIGHT' ? '#09101c' : '#4b4356';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height * 0.65);
        ctx.lineTo(canvas.width * 0.2, canvas.height * 0.44);
        ctx.lineTo(canvas.width * 0.45, canvas.height * 0.58);
        ctx.lineTo(canvas.width * 0.7, canvas.height * 0.40);
        ctx.lineTo(canvas.width, canvas.height * 0.62);
        ctx.lineTo(canvas.width, canvas.height * 0.65);
        ctx.closePath();
        ctx.fill();

        // Forefront Hills & Trees
        ctx.fillStyle = mode === 'NIGHT' ? '#050a12' : '#233728';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        ctx.lineTo(0, canvas.height * 0.62);
        ctx.bezierCurveTo(canvas.width * 0.3, canvas.height * 0.58, canvas.width * 0.6, canvas.height * 0.72, canvas.width, canvas.height * 0.60);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();

        // Pine trees silhouette
        for (let i = 0; i < 12; i++) {
          const tx = i * 110 + 20;
          const ty = canvas.height * 0.62 + (i % 3) * 15;
          ctx.fillStyle = mode === 'NIGHT' ? '#020509' : '#142017';
          ctx.beginPath();
          ctx.moveTo(tx, ty - 45);
          ctx.lineTo(tx + 18, ty);
          ctx.lineTo(tx - 18, ty);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Live sensor read noise & ISO simulation
      if (proSettings.iso !== 'auto' && (proSettings.iso as number) > 800) {
        const noiseAmount = ((proSettings.iso as number) - 800) / 5600;
        const noiseImg = ctx.getImageData(0, 0, 180, 180);
        const nd = noiseImg.data;
        for (let i = 0; i < nd.length; i += 4) {
          if (Math.random() < noiseAmount * 0.4) {
            const v = (Math.random() - 0.5) * 60;
            nd[i] += v;
            nd[i + 1] += v;
            nd[i + 2] += v;
          }
        }
        ctx.putImageData(noiseImg, 0, 0);
      }

      animId = requestAnimationFrame(renderSyntheticScene);
    };

    animId = requestAnimationFrame(renderSyntheticScene);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [usingSyntheticFeed, mode, zoomLevel, proSettings.iso]);

  // Orientation / Artificial Horizon Leveler listener
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null) {
        const roll = Math.round(e.gamma);
        setTiltRoll(roll);
        setIsLevel(Math.abs(roll) <= 1);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  // Audio VU meter simulation during recording
  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      setVuLevel(0.2 + Math.random() * 0.7);
    }, 120);
    return () => clearInterval(interval);
  }, [isRecording]);

  // Capture frame handler registered with parent
  const captureFrameData = useCallback((): ImageData => {
    const canvas = document.createElement('canvas');
    let width = 1920;
    let height = 1080;

    if (aspectRatio === '4:3') {
      width = 4000;
      height = 3000;
    } else if (aspectRatio === '1:1') {
      width = 3000;
      height = 3000;
    } else if (aspectRatio === '16:9') {
      width = 3840;
      height = 2160;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Could not get canvas context');

    if (usingSyntheticFeed && streamCanvasRef.current) {
      ctx.drawImage(streamCanvasRef.current, 0, 0, width, height);
    } else if (videoRef.current && videoRef.current.videoWidth > 0) {
      ctx.drawImage(videoRef.current, 0, 0, width, height);
    } else if (streamCanvasRef.current) {
      ctx.drawImage(streamCanvasRef.current, 0, 0, width, height);
    } else {
      // Fallback blank frame
      ctx.fillStyle = '#101015';
      ctx.fillRect(0, 0, width, height);
    }

    return ctx.getImageData(0, 0, width, height);
  }, [aspectRatio, usingSyntheticFeed]);

  useEffect(() => {
    onRegisterCaptureHandler(async () => captureFrameData());
  }, [onRegisterCaptureHandler, captureFrameData]);

  // Periodic Frame Analysis (Histogram, Peaking, Zebra)
  useEffect(() => {
    let animId: number;

    const analyzeFrame = () => {
      const source = usingSyntheticFeed ? streamCanvasRef.current : videoRef.current;
      if (!source) {
        animId = requestAnimationFrame(analyzeFrame);
        return;
      }

      // Draw onto small analysis canvas
      const analysisCanvas = document.createElement('canvas');
      analysisCanvas.width = 160;
      analysisCanvas.height = 120;
      const actx = analysisCanvas.getContext('2d', { willReadFrequently: true });

      if (actx) {
        try {
          actx.drawImage(source as CanvasImageSource, 0, 0, 160, 120);
          const imgData = actx.getImageData(0, 0, 160, 120);

          // 1. Live Histogram
          if (proSettings.histogram && histogramCanvasRef.current) {
            const hCanvas = histogramCanvasRef.current;
            const hCtx = hCanvas.getContext('2d');
            if (hCtx) {
              const hist = computeHistogram(imgData.data);
              hCtx.clearRect(0, 0, hCanvas.width, hCanvas.height);

              // Background
              hCtx.fillStyle = 'rgba(0, 0, 0, 0.65)';
              hCtx.fillRect(0, 0, hCanvas.width, hCanvas.height);

              const binWidth = hCanvas.width / 256;
              const scale = (hCanvas.height - 4) / hist.max;

              // R G B paths
              const drawCurve = (bins: Uint32Array, color: string) => {
                hCtx.fillStyle = color;
                for (let i = 0; i < 256; i++) {
                  const barH = bins[i] * scale;
                  hCtx.fillRect(i * binWidth, hCanvas.height - barH, binWidth, barH);
                }
              };

              hCtx.globalCompositeOperation = 'screen';
              drawCurve(hist.r, 'rgba(255, 60, 60, 0.6)');
              drawCurve(hist.g, 'rgba(60, 255, 60, 0.6)');
              drawCurve(hist.b, 'rgba(60, 120, 255, 0.6)');
              hCtx.globalCompositeOperation = 'source-over';
            }
          }

          // 2. Focus Peaking & Zebra
          if (overlayCanvasRef.current) {
            const oCanvas = overlayCanvasRef.current;
            const oCtx = oCanvas.getContext('2d');
            if (oCtx) {
              oCtx.clearRect(0, 0, oCanvas.width, oCanvas.height);

              if (proSettings.focusPeaking) {
                renderFocusPeaking(imgData.data, oCtx, 160, 120, 32, 'green');
              }
              if (proSettings.zebraClipping) {
                renderZebraClipping(imgData.data, oCtx, 160, 120, 240);
              }
            }
          }
        } catch {
          // Ignore canvas read errors if camera is loading
        }
      }

      animId = requestAnimationFrame(analyzeFrame);
    };

    animId = requestAnimationFrame(analyzeFrame);
    return () => cancelAnimationFrame(animId);
  }, [usingSyntheticFeed, proSettings.histogram, proSettings.focusPeaking, proSettings.zebraClipping]);

  // Touch to focus handler
  const handleViewfinderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setFocusPoint({ x, y });
    setTimeout(() => setFocusPoint(null), 3000);
  };

  // Active filter style calculation
  const activePreset = CAMERA_FILTERS.find((f) => f.id === filterId);
  const baseFilterCss = activePreset ? activePreset.cssFilter : 'none';
  const finalFilterStyle =
    filterIntensity === 100
      ? baseFilterCss
      : filterIntensity === 0
      ? 'none'
      : `${baseFilterCss} opacity(${0.5 + filterIntensity * 0.005})`;

  // Aspect ratio styling
  const getAspectRatioClasses = () => {
    switch (aspectRatio) {
      case '4:3':
        return 'aspect-[4/3] max-h-[75vh]';
      case '16:9':
        return 'aspect-[16/9] max-h-[80vh]';
      case '1:1':
        return 'aspect-square max-h-[70vh]';
      case 'FULL':
      default:
        return 'w-full h-full';
    }
  };

  return (
    <div
      onClick={handleViewfinderClick}
      className={`relative w-full overflow-hidden bg-black flex items-center justify-center select-none cursor-crosshair ${getAspectRatioClasses()}`}
    >
      {/* Real Video Element */}
      <video
        ref={videoRef}
        playsInline
        autoPlay
        muted
        className={`w-full h-full object-cover transition-transform duration-300 ${
          usingSyntheticFeed ? 'hidden' : 'block'
        }`}
        style={{
          filter: finalFilterStyle,
          transform: `scale(${zoomLevel}) ${selectedFacingMode === 'user' ? 'scaleX(-1)' : ''}`,
        }}
      />

      {/* Synthetic Camera Feed Canvas */}
      <canvas
        ref={streamCanvasRef}
        className={`w-full h-full object-cover transition-transform duration-300 ${
          usingSyntheticFeed ? 'block' : 'hidden'
        }`}
        style={{
          filter: finalFilterStyle,
          transform: `scale(${zoomLevel})`,
        }}
      />

      {/* Real-time Focus Peaking & Zebra Overlay */}
      <canvas
        ref={overlayCanvasRef}
        width={160}
        height={120}
        className="absolute inset-0 w-full h-full pointer-events-none object-cover opacity-80"
        style={{ transform: `scale(${zoomLevel})` }}
      />

      {/* Composition Grid Overlay */}
      {gridType !== 'off' && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {gridType === 'rule_of_thirds' && (
            <div className="w-full h-full grid grid-cols-3 grid-rows-3 border border-white/20">
              <div className="border-r border-b border-white/25" />
              <div className="border-r border-b border-white/25" />
              <div className="border-b border-white/25" />
              <div className="border-r border-b border-white/25" />
              <div className="border-r border-b border-white/25" />
              <div className="border-b border-white/25" />
              <div className="border-r border-white/25" />
              <div className="border-r border-white/25" />
              <div />
            </div>
          )}

          {gridType === 'crosshair' && (
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="w-12 h-12 border border-white/40 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
              </div>
              <div className="absolute w-24 h-[1px] bg-white/30" />
              <div className="absolute h-24 w-[1px] bg-white/30" />
            </div>
          )}

          {gridType === 'golden_ratio' && (
            <svg className="w-full h-full stroke-white/30 fill-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M 0,100 A 100,100 0 0,1 100,0 A 61.8,61.8 0 0,1 38.2,61.8 A 38.2,38.2 0 0,1 76.4,23.6" strokeWidth="0.5" />
              <line x1="38.2" y1="0" x2="38.2" y2="100" strokeWidth="0.3" strokeDasharray="2,2" />
              <line x1="61.8" y1="0" x2="61.8" y2="100" strokeWidth="0.3" strokeDasharray="2,2" />
            </svg>
          )}
        </div>
      )}

      {/* Artificial Horizon / Virtual Gyro Leveler */}
      {showLeveler && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-15">
          <div
            className="relative flex items-center transition-transform duration-75"
            style={{ transform: `rotate(${-tiltRoll}deg)` }}
          >
            <div className={`w-20 h-[2px] rounded-full transition-colors ${isLevel ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-white/60'}`} />
            <div className={`w-3.5 h-3.5 mx-2 rounded-full border-2 transition-colors flex items-center justify-center ${isLevel ? 'border-emerald-400' : 'border-white/60'}`}>
              <div className={`w-1 h-1 rounded-full ${isLevel ? 'bg-emerald-400' : 'bg-white/60'}`} />
            </div>
            <div className={`w-20 h-[2px] rounded-full transition-colors ${isLevel ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-white/60'}`} />
            <span className={`absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono px-1 rounded ${isLevel ? 'text-emerald-400 font-bold' : 'text-white/80'}`}>
              {tiltRoll}°
            </span>
          </div>
        </div>
      )}

      {/* Interactive Touch-to-Focus Reticle */}
      {focusPoint && (
        <div
          className="absolute pointer-events-none z-20 -translate-x-1/2 -translate-y-1/2 transition-transform duration-200"
          style={{ left: focusPoint.x, top: focusPoint.y }}
        >
          <div className="w-16 h-16 border-2 border-amber-400 rounded-sm animate-ping opacity-60 absolute inset-0" />
          <div className="w-16 h-16 border-2 border-amber-400 rounded-sm flex items-center justify-center shadow-lg">
            <div className="w-2 h-2 bg-amber-400 rounded-full" />
            {/* Exposure Slider Icon */}
            <div className="absolute -right-6 top-1 flex flex-col items-center gap-1 text-[9px] text-amber-300 font-bold bg-black/60 px-1 py-0.5 rounded">
              <span>+</span>
              <span>☀</span>
              <span>-</span>
            </div>
          </div>
        </div>
      )}

      {/* Face Tracking Reticle */}
      {mode === 'PORTRAIT' && facePosition && (
        <div
          className="absolute pointer-events-none z-20 border-2 border-emerald-400/90 rounded-lg transition-all duration-300"
          style={{
            left: facePosition.x,
            top: facePosition.y,
            width: facePosition.w,
            height: facePosition.h,
          }}
        >
          <span className="absolute -top-5 left-1 text-[9px] font-mono font-bold bg-emerald-500 text-black px-1.5 rounded">
            FACE AF/AE
          </span>
          {/* Eye Reticles */}
          <div className="absolute top-1/3 left-1/4 w-3 h-3 border border-emerald-300 rounded-full" />
          <div className="absolute top-1/3 right-1/4 w-3 h-3 border border-emerald-300 rounded-full" />
        </div>
      )}

      {/* Multi-frame Stacking Progress HUD */}
      {stackingProgress && (
        <div className="absolute inset-x-4 top-4 z-30 bg-black/85 backdrop-blur-md border border-amber-400/50 rounded-2xl p-3 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between text-xs font-mono text-amber-300 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span className="font-bold uppercase tracking-wider">
                Multi-Frame Stacking Engine
              </span>
            </div>
            <span className="text-white font-bold">
              {stackingProgress.current} / {stackingProgress.total} Frames
            </span>
          </div>

          <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-300 h-2 rounded-full transition-all duration-150"
              style={{
                width: `${(stackingProgress.current / stackingProgress.total) * 100}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1.5 font-mono">
            <span>ALGO: {stackingProgress.algorithm.toUpperCase()}</span>
            <span>NOISE REDUCTION: -{Math.round(Math.sqrt(stackingProgress.current) * 3)}dB</span>
          </div>
        </div>
      )}

      {/* Video Recording HUD */}
      {isRecording && (
        <div className="absolute top-3 left-4 z-20 flex items-center gap-3 bg-red-600/90 text-white px-3 py-1.5 rounded-full font-mono text-xs shadow-lg backdrop-blur-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
          <span className="font-bold">
            {Math.floor(recordingSeconds / 60)
              .toString()
              .padStart(2, '0')}
            :
            {(recordingSeconds % 60).toString().padStart(2, '0')}
          </span>
          <span className="text-[10px] opacity-80 border-l border-white/40 pl-2">
            {mode === 'SLOW_MO' ? '120 FPS' : '1080p 60FPS'}
          </span>

          {/* VU Meter */}
          <div className="w-12 h-2 bg-black/40 rounded-full overflow-hidden flex items-center px-0.5">
            <div
              className="h-1 bg-green-400 rounded-full transition-all duration-75"
              style={{ width: `${vuLevel * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Floating Live Histogram */}
      {proSettings.histogram && (
        <div className="absolute top-3 right-3 z-25 bg-black/75 backdrop-blur-md border border-white/20 rounded-lg p-1.5 shadow-lg">
          <canvas ref={histogramCanvasRef} width={90} height={45} className="rounded" />
          <div className="text-[8px] font-mono text-neutral-400 text-center mt-0.5">RGB HISTOGRAM</div>
        </div>
      )}

      {/* Hardware 108MP Watermark Indicator in Viewfinder */}
      <div className="absolute bottom-20 left-3 z-20 pointer-events-none opacity-80 font-mono text-[10px] text-white/80 drop-shadow flex flex-col">
        <span className="font-bold text-amber-300">REDMI NOTE 15 4G</span>
        <span className="text-[9px] text-neutral-300">ISOCELL HM6 • f/1.75 • 24mm</span>
      </div>

      {/* Zoom Quick Selector Pills */}
      <div className="absolute bottom-4 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
        {[
          { label: '0.6x', val: 0.6, title: 'Ultra-Wide 8MP' },
          { label: '1x', val: 1.0, title: 'Wide 108MP HM6' },
          { label: '2x', val: 2.0, title: 'In-Sensor 2x Lossless' },
          { label: '5x', val: 5.0, title: '5x Digital Zoom' },
          { label: '10x', val: 10.0, title: '10x Super Zoom' },
        ].map((z) => (
          <button
            key={z.label}
            onClick={(e) => {
              e.stopPropagation();
              onZoomChange(z.val);
            }}
            className={`w-7 h-7 rounded-full text-[10px] font-mono font-bold flex items-center justify-center transition active:scale-95 ${
              zoomLevel === z.val
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
            title={z.title}
          >
            {z.label}
          </button>
        ))}
      </div>
    </div>
  );
};
