import React from 'react';
import { AstrophotographyConfig, StackingAlgorithm } from '../types/camera';
import { calculateStarTrailLimit } from '../utils/stackingEngine';
import { Moon, Star, Compass, Layers, ShieldCheck } from 'lucide-react';

interface AstrophotographyPanelProps {
  config: AstrophotographyConfig;
  onChange: (updated: Partial<AstrophotographyConfig>) => void;
  isMoonMode: boolean;
}

export const AstrophotographyPanel: React.FC<AstrophotographyPanelProps> = ({
  config,
  onChange,
  isMoonMode,
}) => {
  const starTrailLimit = calculateStarTrailLimit(5.2, 4.6); // Redmi Note 15 4G 24mm equivalent

  const algorithms: { id: StackingAlgorithm; name: string; desc: string }[] = [
    {
      id: 'sigma_clipping',
      name: 'Sigma Clipping (Pro Astro)',
      desc: 'Rejects satellite trails & cosmic rays, keeps crystal star points.',
    },
    {
      id: 'max_detail',
      name: 'Maximum Detail (Sharpness)',
      desc: 'Weights pixels by edge contrast; sharpest for lunar craters.',
    },
    {
      id: 'median',
      name: 'Median Stacking',
      desc: 'Statistical median; eliminates airplanes and moving clouds.',
    },
    {
      id: 'average',
      name: 'Average Stacking',
      desc: 'Reduces random thermal sensor noise by sqrt(N).',
    },
  ];

  return (
    <div className="w-full bg-black/92 backdrop-blur-md border-t border-amber-500/20 text-white p-3 z-30 select-none">
      <div className="max-w-xl mx-auto flex flex-col gap-2.5">
        {/* Header with Astro / Moon Info */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            {isMoonMode ? (
              <Moon className="w-5 h-5 text-amber-300 fill-amber-300/20" />
            ) : (
              <Star className="w-5 h-5 text-amber-400 fill-amber-400/20" />
            )}
            <div>
              <h4 className="text-xs font-mono font-bold text-amber-300">
                {isMoonMode ? 'LUNAR STACKING & DETAIL ENGINE' : 'DEEP SKY ASTROPHOTOGRAPHY'}
              </h4>
              <p className="text-[10px] text-neutral-400 font-mono">
                {isMoonMode
                  ? 'Prevents overexposed lunar surface & sharpens basalt maria'
                  : `500-Rule Max Shutter: ${starTrailLimit}s on Redmi Note 15 4G 24mm`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-700 px-2 py-1 rounded-lg">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-mono text-emerald-300 font-semibold">
              Tripod Recommended
            </span>
          </div>
        </div>

        {/* Frame Count Selector */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-mono text-neutral-300 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            Stack Frames:
          </span>
          <div className="flex items-center gap-1.5">
            {[5, 10, 20, 30, 50, 100].map((count) => (
              <button
                key={count}
                onClick={() => onChange({ frameCount: count })}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition active:scale-95 ${
                  config.frameCount === count
                    ? 'bg-amber-400 text-black shadow-md'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {count}x
              </button>
            ))}
          </div>
        </div>

        {/* Algorithm Picker */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-mono text-neutral-300">Algorithm:</span>
          <select
            value={config.algorithm}
            onChange={(e) => onChange({ algorithm: e.target.value as StackingAlgorithm })}
            className="bg-neutral-800 border border-neutral-700 text-amber-300 text-xs font-mono rounded-lg px-2.5 py-1 focus:outline-none focus:border-amber-400"
          >
            {algorithms.map((algo) => (
              <option key={algo.id} value={algo.id}>
                {algo.name}
              </option>
            ))}
          </select>
        </div>

        {/* Advanced Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5">
          <button
            onClick={() => onChange({ starAlignment: !config.starAlignment })}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono border transition ${
              config.starAlignment
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                : 'border-neutral-700 text-neutral-400'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            Star Centroid Alignment: {config.starAlignment ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => onChange({ darkFrameSubtraction: !config.darkFrameSubtraction })}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono border transition ${
              config.darkFrameSubtraction
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                : 'border-neutral-700 text-neutral-400'
            }`}
          >
            Dark Frame Subtraction: {config.darkFrameSubtraction ? 'ON' : 'OFF'}
          </button>

          {isMoonMode && (
            <button
              onClick={() => onChange({ moonHighlightProtection: !config.moonHighlightProtection })}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono border transition ${
                config.moonHighlightProtection
                  ? 'bg-blue-500/20 border-blue-400 text-blue-300 font-bold'
                  : 'border-neutral-700 text-neutral-400'
              }`}
            >
              Highlight Protection: {config.moonHighlightProtection ? 'ON' : 'OFF'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
