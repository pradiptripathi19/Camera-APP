import React, { useState } from 'react';
import { ProSettings, MeteringMode } from '../types/camera';
import { formatShutterSpeed } from '../utils/imageProcessing';

interface ProControlsPanelProps {
  settings: ProSettings;
  onChange: (updated: Partial<ProSettings>) => void;
}

type ProTab = 'ISO' | 'S' | 'F' | 'WB' | 'EV' | 'MORE';

export const ProControlsPanel: React.FC<ProControlsPanelProps> = ({
  settings,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<ProTab>('ISO');

  const isoOptions: (number | 'auto')[] = ['auto', 50, 100, 200, 400, 800, 1600, 3200, 6400];
  const shutterOptions: (number | 'auto')[] = [
    'auto',
    1 / 8000,
    1 / 4000,
    1 / 2000,
    1 / 1000,
    1 / 500,
    1 / 250,
    1 / 125,
    1 / 60,
    1 / 30,
    1 / 15,
    1 / 8,
    1 / 4,
    1 / 2,
    1,
    2,
    4,
    8,
    15,
    30,
  ];
  const wbPresets: { label: string; kelvin: number | 'auto' }[] = [
    { label: 'Auto', kelvin: 'auto' },
    { label: 'Incandescent (3000K)', kelvin: 3000 },
    { label: 'Fluorescent (4000K)', kelvin: 4000 },
    { label: 'Daylight (5500K)', kelvin: 5500 },
    { label: 'Cloudy (6500K)', kelvin: 6500 },
    { label: 'Shade (7500K)', kelvin: 7500 },
  ];

  return (
    <div className="w-full bg-black/90 backdrop-blur-md border-t border-white/10 text-white p-3 z-30 select-none">
      {/* Sub-slider value strip */}
      <div className="flex items-center justify-center gap-1.5 overflow-x-auto py-2 no-scrollbar">
        {activeTab === 'ISO' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-neutral-400">ISO:</span>
            {isoOptions.map((iso) => (
              <button
                key={String(iso)}
                onClick={() => onChange({ iso })}
                className={`px-3 py-1 rounded-full text-xs font-mono transition active:scale-95 whitespace-nowrap ${
                  settings.iso === iso
                    ? 'bg-amber-400 text-black font-bold shadow'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {iso === 'auto' ? 'Auto' : iso}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'S' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-neutral-400">SPEED:</span>
            {shutterOptions.map((s) => (
              <button
                key={String(s)}
                onClick={() => onChange({ shutterSpeed: s })}
                className={`px-2.5 py-1 rounded-full text-xs font-mono transition active:scale-95 whitespace-nowrap ${
                  settings.shutterSpeed === s
                    ? 'bg-amber-400 text-black font-bold shadow'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {formatShutterSpeed(s)}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'F' && (
          <div className="flex items-center gap-4 w-full max-w-md px-2">
            <button
              onClick={() => onChange({ focusDistance: 'auto' })}
              className={`px-3 py-1 rounded-full text-xs font-mono transition ${
                settings.focusDistance === 'auto'
                  ? 'bg-amber-400 text-black font-bold'
                  : 'bg-neutral-800 text-neutral-300'
              }`}
            >
              AF
            </button>
            <div className="flex-1 flex items-center gap-2">
              <span className="text-[10px] font-mono text-neutral-400">Macro</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.focusDistance === 'auto' ? 0.5 : settings.focusDistance}
                onChange={(e) => onChange({ focusDistance: parseFloat(e.target.value) })}
                className="w-full accent-amber-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-mono text-neutral-400">∞</span>
            </div>
            <span className="text-xs font-mono text-amber-300 w-12 text-right">
              {settings.focusDistance === 'auto'
                ? 'AUTO'
                : `${Math.round((settings.focusDistance as number) * 100)}%`}
            </span>
          </div>
        )}

        {activeTab === 'WB' && (
          <div className="flex items-center gap-2">
            {wbPresets.map((wb) => (
              <button
                key={String(wb.kelvin)}
                onClick={() => onChange({ whiteBalance: wb.kelvin })}
                className={`px-3 py-1 rounded-full text-xs font-mono transition active:scale-95 whitespace-nowrap ${
                  settings.whiteBalance === wb.kelvin
                    ? 'bg-amber-400 text-black font-bold shadow'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {wb.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'EV' && (
          <div className="flex items-center gap-4 w-full max-w-md px-2">
            <span className="text-xs font-mono text-neutral-400">-3.0</span>
            <input
              type="range"
              min="-3"
              max="3"
              step="0.33"
              value={settings.exposureComp}
              onChange={(e) => onChange({ exposureComp: parseFloat(e.target.value) })}
              className="w-full accent-amber-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono text-neutral-400">+3.0</span>
            <span className="text-xs font-mono text-amber-300 w-16 text-right font-bold">
              {settings.exposureComp > 0 ? `+${settings.exposureComp.toFixed(1)}` : settings.exposureComp.toFixed(1)} EV
            </span>
          </div>
        )}

        {activeTab === 'MORE' && (
          <div className="flex flex-wrap items-center justify-center gap-3 py-1">
            {/* Format Selection */}
            <div className="flex items-center gap-1 bg-neutral-800/80 p-1 rounded-lg border border-neutral-700">
              <span className="text-[10px] font-mono text-neutral-400 px-1">FMT:</span>
              {(['jpeg', 'png', 'webp', 'dng'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => onChange({ format: fmt })}
                  className={`px-2 py-0.5 text-[10px] font-mono rounded uppercase font-bold transition ${
                    settings.format === fmt
                      ? 'bg-amber-400 text-black shadow'
                      : 'text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  {fmt === 'dng' ? 'RAW (DNG)' : fmt}
                </button>
              ))}
            </div>

            {/* Metering Mode */}
            <div className="flex items-center gap-1 bg-neutral-800/80 p-1 rounded-lg border border-neutral-700">
              <span className="text-[10px] font-mono text-neutral-400 px-1">MTR:</span>
              {(['matrix', 'center', 'spot'] as MeteringMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => onChange({ metering: m })}
                  className={`px-2 py-0.5 text-[10px] font-mono rounded capitalize transition ${
                    settings.metering === m
                      ? 'bg-amber-400 text-black font-semibold'
                      : 'text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Overlays Toggles */}
            <button
              onClick={() => onChange({ focusPeaking: !settings.focusPeaking })}
              className={`px-2 py-1 text-[10px] font-mono rounded border transition ${
                settings.focusPeaking
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                  : 'border-neutral-700 text-neutral-400'
              }`}
            >
              Peaking {settings.focusPeaking ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={() => onChange({ zebraClipping: !settings.zebraClipping })}
              className={`px-2 py-1 text-[10px] font-mono rounded border transition ${
                settings.zebraClipping
                  ? 'bg-red-500/20 border-red-400 text-red-300 font-bold'
                  : 'border-neutral-700 text-neutral-400'
              }`}
            >
              Zebra {settings.zebraClipping ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={() => onChange({ histogram: !settings.histogram })}
              className={`px-2 py-1 text-[10px] font-mono rounded border transition ${
                settings.histogram
                  ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold'
                  : 'border-neutral-700 text-neutral-400'
              }`}
            >
              Histogram {settings.histogram ? 'ON' : 'OFF'}
            </button>
          </div>
        )}
      </div>

      {/* Main PRO Selector Dial Bar */}
      <div className="grid grid-cols-6 gap-1 pt-1 border-t border-white/10">
        {[
          { tab: 'ISO' as ProTab, label: 'ISO', val: settings.iso === 'auto' ? 'AUTO' : settings.iso },
          { tab: 'S' as ProTab, label: 'S', val: formatShutterSpeed(settings.shutterSpeed) },
          {
            tab: 'F' as ProTab,
            label: 'F',
            val: settings.focusDistance === 'auto' ? 'AF' : `${Math.round((settings.focusDistance as number) * 100)}%`,
          },
          {
            tab: 'WB' as ProTab,
            label: 'WB',
            val: settings.whiteBalance === 'auto' ? 'AWB' : `${settings.whiteBalance}K`,
          },
          {
            tab: 'EV' as ProTab,
            label: 'EV',
            val: settings.exposureComp === 0 ? '0.0' : `${settings.exposureComp > 0 ? '+' : ''}${settings.exposureComp.toFixed(1)}`,
          },
          { tab: 'MORE' as ProTab, label: 'MORE', val: settings.format.toUpperCase() },
        ].map(({ tab, label, val }) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex flex-col items-center py-1 rounded transition active:scale-95 ${
              activeTab === tab
                ? 'bg-neutral-800 border-b-2 border-amber-400'
                : 'hover:bg-neutral-900/50 text-neutral-400'
            }`}
          >
            <span className={`text-[10px] font-mono font-bold ${activeTab === tab ? 'text-amber-400' : 'text-neutral-400'}`}>
              {label}
            </span>
            <span className="text-[10px] font-mono text-neutral-200 truncate max-w-[50px]">
              {String(val)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
