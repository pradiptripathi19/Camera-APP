import React from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Grid,
  Shield,
  Compass,
  FileImage,
  Video,
  Database,
} from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  gridType: 'off' | 'rule_of_thirds' | 'golden_ratio' | 'crosshair';
  onGridChange: (grid: 'off' | 'rule_of_thirds' | 'golden_ratio' | 'crosshair') => void;
  showLeveler: boolean;
  onToggleLeveler: () => void;
  watermark: boolean;
  onToggleWatermark: () => void;
  shutterSound: boolean;
  onToggleShutterSound: () => void;
  defaultFormat: 'jpeg' | 'png' | 'webp' | 'dng';
  onFormatChange: (fmt: 'jpeg' | 'png' | 'webp' | 'dng') => void;
  stabilizationMode: 'standard' | 'enhanced' | 'maximum';
  onStabilizationChange: (mode: 'standard' | 'enhanced' | 'maximum') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  gridType,
  onGridChange,
  showLeveler,
  onToggleLeveler,
  watermark,
  onToggleWatermark,
  shutterSound,
  onToggleShutterSound,
  defaultFormat,
  onFormatChange,
  stabilizationMode,
  onStabilizationChange,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md text-white flex flex-col select-none overflow-hidden animate-fade-in p-4 sm:p-6">
      <div className="max-w-xl w-full mx-auto bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/60">
          <div>
            <h2 className="text-sm font-mono font-bold text-amber-400">CAMERA SETTINGS</h2>
            <p className="text-[11px] text-neutral-400 font-mono">
              Xiaomi Redmi Note 15 4G ProCam Preferences
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs font-mono">
          {/* Default Image Format */}
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4">
            <span className="text-neutral-300 font-bold flex items-center gap-2 mb-2">
              <FileImage className="w-4 h-4 text-amber-400" />
              Default Image Format
            </span>
            <div className="grid grid-cols-4 gap-2">
              {(['jpeg', 'png', 'webp', 'dng'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => onFormatChange(fmt)}
                  className={`py-2 rounded-lg font-mono text-center uppercase font-bold transition active:scale-95 ${
                    defaultFormat === fmt
                      ? 'bg-amber-400 text-black shadow'
                      : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                  }`}
                >
                  {fmt === 'dng' ? 'RAW (DNG)' : fmt}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-neutral-500 mt-2">
              DNG preserves uncompressed raw sensor mosaic with complete 16-bit dynamic headroom.
            </p>
          </div>

          {/* Composition Framing Guides */}
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4">
            <span className="text-neutral-300 font-bold flex items-center gap-2 mb-2">
              <Grid className="w-4 h-4 text-amber-400" />
              Framing Grid &amp; Composition Lines
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'off', label: 'Off' },
                { id: 'rule_of_thirds', label: '3x3 Grid' },
                { id: 'golden_ratio', label: 'Golden Spiral' },
                { id: 'crosshair', label: 'Center Cross' },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => onGridChange(g.id as any)}
                  className={`py-2 rounded-lg font-mono text-center text-[11px] transition active:scale-95 ${
                    gridType === g.id
                      ? 'bg-amber-400 text-black font-bold shadow'
                      : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stabilization Mode */}
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4">
            <span className="text-neutral-300 font-bold flex items-center gap-2 mb-2">
              <Video className="w-4 h-4 text-amber-400" />
              Video &amp; Motion Stabilization (EIS + Gyro)
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'standard', label: 'Standard EIS' },
                { id: 'enhanced', label: 'Enhanced Gyro' },
                { id: 'maximum', label: 'Maximum Lock' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => onStabilizationChange(s.id as any)}
                  className={`py-2 rounded-lg font-mono text-center text-[11px] transition active:scale-95 ${
                    stabilizationMode === s.id
                      ? 'bg-amber-400 text-black font-bold shadow'
                      : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles List */}
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl divide-y divide-neutral-800">
            {/* Artificial Horizon */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-neutral-200 font-semibold">Artificial Horizon Leveler</div>
                  <div className="text-[10px] text-neutral-500">
                    Live gyro indicator with level snap-to-green guidance
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={showLeveler}
                onChange={onToggleLeveler}
                className="w-4 h-4 accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Device Watermark */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-neutral-200 font-semibold">Redmi Note 15 4G Watermark</div>
                  <div className="text-[10px] text-neutral-500">
                    Stamp &quot;Shot on Redmi Note 15 4G | 108MP ProCam&quot;
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={watermark}
                onChange={onToggleWatermark}
                className="w-4 h-4 accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Shutter Sound */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {shutterSound ? (
                  <Volume2 className="w-4 h-4 text-amber-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-neutral-500" />
                )}
                <div>
                  <div className="text-neutral-200 font-semibold">Shutter Sound &amp; Audio Feedback</div>
                  <div className="text-[10px] text-neutral-500">
                    Audio click on photo capture and recording start
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={shutterSound}
                onChange={onToggleShutterSound}
                className="w-4 h-4 accent-amber-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs transition active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
