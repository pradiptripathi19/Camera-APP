import React, { useState } from 'react';
import {
  Zap,
  ZapOff,
  Sun,
  Timer,
  SlidersHorizontal,
  Cpu,
  Sparkles,
  Smartphone,
  ChevronDown,
} from 'lucide-react';
import { FlashMode, HdrMode, AspectRatio, TimerMode } from '../types/camera';

interface TopControlsProps {
  flash: FlashMode;
  onFlashChange: (mode: FlashMode) => void;
  hdr: HdrMode;
  onHdrChange: (mode: HdrMode) => void;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  timer: TimerMode;
  onTimerChange: (timer: TimerMode) => void;
  onOpenSettings: () => void;
  onOpenHardwareDashboard: () => void;
  onOpenAndroidProject: () => void;
  macroActive: boolean;
  onToggleMacro: () => void;
}

export const TopControls: React.FC<TopControlsProps> = ({
  flash,
  onFlashChange,
  hdr,
  onHdrChange,
  aspectRatio,
  onAspectRatioChange,
  timer,
  onTimerChange,
  onOpenSettings,
  onOpenHardwareDashboard,
  onOpenAndroidProject,
  macroActive,
  onToggleMacro,
}) => {
  const [showRatioMenu, setShowRatioMenu] = useState(false);
  const [showTimerMenu, setShowTimerMenu] = useState(false);

  const cycleFlash = () => {
    const cycle: Record<FlashMode, FlashMode> = {
      off: 'auto',
      auto: 'on',
      on: 'torch',
      torch: 'off',
    };
    onFlashChange(cycle[flash]);
  };

  const cycleHdr = () => {
    const cycle: Record<HdrMode, HdrMode> = {
      off: 'auto',
      auto: 'on',
      on: 'off',
    };
    onHdrChange(cycle[hdr]);
  };

  return (
    <div className="relative w-full z-30 bg-gradient-to-b from-black/80 via-black/40 to-transparent pt-3 pb-2 px-3 text-white select-none">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {/* Flash */}
        <button
          onClick={cycleFlash}
          className="flex flex-col items-center justify-center p-2 rounded-full hover:bg-white/10 active:scale-95 transition"
          aria-label={`Flash: ${flash}`}
          title={`Flash: ${flash.toUpperCase()}`}
        >
          {flash === 'off' ? (
            <ZapOff className="w-5 h-5 text-neutral-400" />
          ) : flash === 'torch' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Zap className={`w-5 h-5 ${flash === 'on' ? 'text-amber-400 fill-amber-400' : 'text-amber-300'}`} />
          )}
          <span className="text-[9px] font-mono tracking-tighter mt-0.5 uppercase">
            {flash}
          </span>
        </button>

        {/* HDR */}
        <button
          onClick={cycleHdr}
          className="flex flex-col items-center justify-center p-2 rounded-full hover:bg-white/10 active:scale-95 transition"
          aria-label={`HDR: ${hdr}`}
          title={`HDR: ${hdr.toUpperCase()}`}
        >
          <div
            className={`text-[11px] font-bold px-1.5 py-0.5 rounded transition ${
              hdr === 'on'
                ? 'bg-amber-400 text-black shadow-sm'
                : hdr === 'auto'
                ? 'border border-amber-400/80 text-amber-300'
                : 'text-neutral-400 border border-neutral-600'
            }`}
          >
            HDR
          </div>
          <span className="text-[9px] font-mono tracking-tighter mt-0.5 uppercase">
            {hdr}
          </span>
        </button>

        {/* Aspect Ratio */}
        <div className="relative">
          <button
            onClick={() => setShowRatioMenu(!showRatioMenu)}
            className="flex flex-col items-center justify-center p-2 rounded-full hover:bg-white/10 active:scale-95 transition"
            aria-label={`Aspect Ratio: ${aspectRatio}`}
            title="Aspect Ratio"
          >
            <div className="border border-white/60 rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold flex items-center gap-0.5">
              {aspectRatio}
              <ChevronDown className="w-2.5 h-2.5 text-neutral-400" />
            </div>
            <span className="text-[9px] font-mono text-neutral-400 mt-0.5">Ratio</span>
          </button>

          {showRatioMenu && (
            <div className="absolute top-12 -left-6 bg-neutral-900/95 backdrop-blur-md border border-neutral-800 rounded-xl p-1 shadow-xl flex flex-col gap-1 z-40 min-w-[90px]">
              {(['4:3', '16:9', '1:1', 'FULL'] as AspectRatio[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    onAspectRatioChange(r);
                    setShowRatioMenu(false);
                  }}
                  className={`px-3 py-1.5 text-xs text-left rounded-lg transition font-mono ${
                    aspectRatio === r
                      ? 'bg-amber-400 text-black font-semibold'
                      : 'text-neutral-200 hover:bg-white/10'
                  }`}
                >
                  {r} {r === '4:3' && '(108MP)'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Macro */}
        <button
          onClick={onToggleMacro}
          className={`flex flex-col items-center justify-center p-2 rounded-full hover:bg-white/10 active:scale-95 transition ${
            macroActive ? 'text-amber-400' : 'text-neutral-400'
          }`}
          aria-label="Macro Lens Mode"
          title="Super Macro 2MP Mode"
        >
          <Sparkles className={`w-5 h-5 ${macroActive ? 'text-amber-400 fill-amber-400/20' : ''}`} />
          <span className="text-[9px] font-mono tracking-tighter mt-0.5">
            {macroActive ? 'MACRO' : 'Macro'}
          </span>
        </button>

        {/* Timer */}
        <div className="relative">
          <button
            onClick={() => setShowTimerMenu(!showTimerMenu)}
            className="flex flex-col items-center justify-center p-2 rounded-full hover:bg-white/10 active:scale-95 transition"
            aria-label={`Timer: ${timer ? `${timer}s` : 'Off'}`}
            title="Self Timer"
          >
            <Timer className={`w-5 h-5 ${timer > 0 ? 'text-amber-400' : 'text-neutral-400'}`} />
            <span className="text-[9px] font-mono tracking-tighter mt-0.5">
              {timer > 0 ? `${timer}s` : 'Off'}
            </span>
          </button>

          {showTimerMenu && (
            <div className="absolute top-12 -left-4 bg-neutral-900/95 backdrop-blur-md border border-neutral-800 rounded-xl p-1 shadow-xl flex flex-col gap-1 z-40 min-w-[80px]">
              {([0, 3, 5, 10] as TimerMode[]).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    onTimerChange(t);
                    setShowTimerMenu(false);
                  }}
                  className={`px-3 py-1.5 text-xs text-left rounded-lg transition font-mono ${
                    timer === t
                      ? 'bg-amber-400 text-black font-semibold'
                      : 'text-neutral-200 hover:bg-white/10'
                  }`}
                >
                  {t === 0 ? 'Off' : `${t}s`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Redmi 15 4G Hardware HAL Dashboard */}
        <button
          onClick={onOpenHardwareDashboard}
          className="flex flex-col items-center justify-center p-2 rounded-full hover:bg-amber-400/20 active:scale-95 transition group"
          aria-label="Redmi Note 15 4G Hardware HAL Dashboard"
          title="Camera Hardware HAL Diagnostic (108MP HM6)"
        >
          <div className="relative">
            <Cpu className="w-5 h-5 text-amber-400 group-hover:animate-pulse" />
            <span className="absolute -top-1 -right-2 text-[8px] bg-red-600 text-white px-1 rounded-full font-bold">
              108M
            </span>
          </div>
          <span className="text-[9px] font-mono text-amber-300 tracking-tighter mt-0.5">HAL</span>
        </button>

        {/* Android Studio Kotlin Project & APK Export */}
        <button
          onClick={onOpenAndroidProject}
          className="flex flex-col items-center justify-center p-2 rounded-full hover:bg-emerald-400/20 active:scale-95 transition"
          aria-label="Android Studio APK Project Code"
          title="Android Project & APK Source Center"
        >
          <Smartphone className="w-5 h-5 text-emerald-400" />
          <span className="text-[9px] font-mono text-emerald-300 tracking-tighter mt-0.5">APK</span>
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="flex flex-col items-center justify-center p-2 rounded-full hover:bg-white/10 active:scale-95 transition"
          aria-label="Camera Settings"
          title="Camera Settings"
        >
          <SlidersHorizontal className="w-5 h-5 text-neutral-300" />
          <span className="text-[9px] font-mono text-neutral-400 tracking-tighter mt-0.5">Set</span>
        </button>
      </div>
    </div>
  );
};
