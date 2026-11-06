import React, { useState } from 'react';
import { CAMERA_FILTERS } from '../utils/imageProcessing';
import { X, RotateCcw } from 'lucide-react';

interface FilterPickerProps {
  activeFilterId: string;
  onSelectFilter: (id: string) => void;
  intensity: number;
  onIntensityChange: (intensity: number) => void;
  onClose: () => void;
}

type FilterCategory = 'All' | 'Natural' | 'Cinematic' | 'Film' | 'Portrait' | 'Creative';

export const FilterPicker: React.FC<FilterPickerProps> = ({
  activeFilterId,
  onSelectFilter,
  intensity,
  onIntensityChange,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('All');

  const categories: FilterCategory[] = ['All', 'Natural', 'Cinematic', 'Film', 'Portrait', 'Creative'];

  const filteredPresets =
    selectedCategory === 'All'
      ? CAMERA_FILTERS
      : CAMERA_FILTERS.filter((f) => f.category === selectedCategory);

  return (
    <div className="w-full bg-black/95 backdrop-blur-xl border-t border-white/10 text-white p-3 z-35 animate-fade-in select-none">
      <div className="max-w-2xl mx-auto flex flex-col gap-2.5">
        {/* Header & Intensity Slider */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-amber-400">28 PRO FILTERS</span>
            <button
              onClick={() => {
                onSelectFilter('natural');
                onIntensityChange(100);
              }}
              className="flex items-center gap-1 text-[10px] font-mono text-neutral-400 hover:text-white transition"
              title="Reset to Original"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Original
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-neutral-400">Intensity:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={intensity}
              onChange={(e) => onIntensityChange(parseInt(e.target.value, 10))}
              className="w-24 accent-amber-400 h-1 bg-neutral-800 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono text-amber-300 w-8 text-right font-bold">
              {intensity}%
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition ml-2"
              aria-label="Close Filter Picker"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-mono transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-amber-400 text-black font-bold shadow'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filter Thumbnail Carousel */}
        <div className="flex items-center gap-2.5 overflow-x-auto py-1 no-scrollbar">
          {filteredPresets.map((preset) => {
            const isSelected = activeFilterId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectFilter(preset.id)}
                className={`flex flex-col items-center gap-1 min-w-[68px] transition active:scale-95 group ${
                  isSelected ? 'scale-105' : 'opacity-80 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-xl overflow-hidden relative border-2 transition ${
                    isSelected
                      ? 'border-amber-400 ring-2 ring-amber-400/40'
                      : 'border-white/20 group-hover:border-white/60'
                  }`}
                >
                  {/* Miniature swatch simulation */}
                  <div
                    className="w-full h-full bg-gradient-to-tr from-amber-900 via-rose-700 to-sky-500"
                    style={{ filter: preset.cssFilter }}
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-amber-400/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                    </div>
                  )}
                </div>
                <span
                  className={`text-[10px] font-mono text-center truncate max-w-[64px] ${
                    isSelected ? 'text-amber-300 font-bold' : 'text-neutral-300'
                  }`}
                >
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
