import React, { useRef, useEffect } from 'react';
import { CameraMode, CapturedMedia } from '../types/camera';
import { SwitchCamera, Wand2 } from 'lucide-react';

interface BottomBarProps {
  currentMode: CameraMode;
  onModeChange: (mode: CameraMode) => void;
  onShutterPress: () => void;
  isRecording: boolean;
  isProcessing: boolean;
  latestMedia: CapturedMedia | null;
  mediaCount: number;
  onOpenGallery: () => void;
  onToggleCameraFacing: () => void;
  onToggleFilterPicker: () => void;
  filterActive: boolean;
}

const MODES: { id: CameraMode; label: string }[] = [
  { id: 'PRO', label: 'PRO' },
  { id: 'PHOTO', label: 'PHOTO' },
  { id: 'VIDEO', label: 'VIDEO' },
  { id: 'PORTRAIT', label: 'PORTRAIT' },
  { id: 'NIGHT', label: 'NIGHT' },
  { id: 'ASTRO', label: 'ASTRO' },
  { id: 'MOON', label: 'MOON' },
  { id: 'PANORAMA', label: 'PANORAMA' },
  { id: 'SLOW_MO', label: 'SLOW-MO' },
  { id: 'TIME_LAPSE', label: 'TIME-LAPSE' },
];

export const BottomBar: React.FC<BottomBarProps> = ({
  currentMode,
  onModeChange,
  onShutterPress,
  isRecording,
  isProcessing,
  latestMedia,
  mediaCount,
  onOpenGallery,
  onToggleCameraFacing,
  onToggleFilterPicker,
  filterActive,
}) => {
  const modeScrollRef = useRef<HTMLDivElement | null>(null);

  // Center active mode into view
  useEffect(() => {
    if (modeScrollRef.current) {
      const activeEl = modeScrollRef.current.querySelector(
        `[data-mode="${currentMode}"]`
      ) as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
    }
  }, [currentMode]);

  return (
    <div className="w-full bg-black/95 backdrop-blur-xl border-t border-white/5 text-white flex flex-col items-center justify-between z-30 select-none pb-4 pt-2">
      {/* Horizontal Mode Carousel */}
      <div
        ref={modeScrollRef}
        className="w-full flex items-center justify-start gap-5 px-6 overflow-x-auto no-scrollbar scroll-smooth mb-3"
      >
        {MODES.map((mode) => {
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              data-mode={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={`text-xs font-mono tracking-wider transition-all duration-200 whitespace-nowrap py-1 flex flex-col items-center ${
                isActive
                  ? 'text-amber-400 font-bold scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {mode.label}
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 shadow-sm animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Shutter Button Row */}
      <div className="w-full max-w-md px-8 flex items-center justify-between">
        {/* Gallery Thumbnail Preview */}
        <button
          onClick={onOpenGallery}
          className="relative w-12 h-12 rounded-full border-2 border-white/30 overflow-hidden hover:border-amber-400 transition active:scale-95 flex items-center justify-center bg-neutral-900 group"
          aria-label="Open Gallery"
          title="Open ProCam Gallery"
        >
          {latestMedia ? (
            <img
              src={latestMedia.url}
              alt="Latest capture"
              className="w-full h-full object-cover group-hover:scale-105 transition"
            />
          ) : (
            <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-[10px] text-neutral-400 font-mono">
              Empty
            </div>
          )}
          {mediaCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-400 text-black font-mono font-bold text-[9px] px-1.5 py-0.2 rounded-full shadow">
              {mediaCount}
            </span>
          )}
        </button>

        {/* Iconic Xiaomi Tactile Shutter Button */}
        <div className="relative flex items-center justify-center">
          <button
            onClick={onShutterPress}
            disabled={isProcessing}
            aria-label={
              currentMode === 'VIDEO' || currentMode === 'SLOW_MO' || currentMode === 'TIME_LAPSE'
                ? isRecording
                  ? 'Stop Recording'
                  : 'Start Recording'
                : 'Capture Photo'
            }
            className={`relative rounded-full flex items-center justify-center transition-all duration-150 active:scale-90 ${
              isProcessing ? 'opacity-60 cursor-wait' : ''
            } w-20 h-20 border-4 ${
              currentMode === 'VIDEO' || currentMode === 'SLOW_MO' || currentMode === 'TIME_LAPSE'
                ? 'border-white/80'
                : 'border-white/90'
            } p-1 shadow-2xl`}
          >
            {/* Inner Shutter Core */}
            {currentMode === 'VIDEO' || currentMode === 'SLOW_MO' || currentMode === 'TIME_LAPSE' ? (
              <div
                className={`transition-all duration-300 ${
                  isRecording
                    ? 'w-7 h-7 rounded-sm bg-red-600 animate-pulse'
                    : 'w-14 h-14 rounded-full bg-red-600 shadow-md'
                }`}
              />
            ) : (
              <div
                className={`w-14 h-14 rounded-full transition-transform duration-100 ${
                  isProcessing
                    ? 'bg-amber-400 animate-spin border-4 border-black/40'
                    : 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.4)] hover:bg-neutral-100'
                }`}
              />
            )}
          </button>

          {/* Stacking / Continuous indicator label */}
          {isProcessing && (
            <div className="absolute -bottom-5 text-[9px] font-mono text-amber-300 font-bold tracking-wider animate-pulse whitespace-nowrap">
              PROCESSING...
            </div>
          )}
        </div>

        {/* Right Action Buttons (Filters & Camera Flip) */}
        <div className="flex items-center gap-3">
          {/* Filter Quick Trigger */}
          <button
            onClick={onToggleFilterPicker}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition active:scale-95 ${
              filterActive
                ? 'border-amber-400 bg-amber-400/20 text-amber-300'
                : 'border-white/20 bg-neutral-900 text-neutral-300 hover:text-white'
            }`}
            aria-label="Toggle Filters"
            title="28 Pro Camera Filters"
          >
            <Wand2 className="w-5 h-5" />
          </button>

          {/* Camera Flip (Rear 108MP <-> Front 16MP) */}
          <button
            onClick={onToggleCameraFacing}
            className="w-11 h-11 rounded-full border border-white/20 bg-neutral-900 flex items-center justify-center text-white hover:border-amber-400 transition active:scale-95"
            aria-label="Switch Camera Facing"
            title="Switch Rear 108MP / Front 16MP"
          >
            <SwitchCamera className="w-5 h-5 text-neutral-200" />
          </button>
        </div>
      </div>
    </div>
  );
};
