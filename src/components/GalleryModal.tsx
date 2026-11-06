import React, { useState } from 'react';
import { CapturedMedia } from '../types/camera';
import { CAMERA_FILTERS } from '../utils/imageProcessing';
import { downloadBinaryFile, createDngFile } from '../utils/dngExporter';
import {
  X,
  Trash2,
  Share2,
  Sliders,
  Download,
  RotateCw,
  FlipHorizontal,
  Info,
  Heart,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';

interface GalleryModalProps {
  mediaList: CapturedMedia[];
  onClose: () => void;
  onDeleteMedia: (id: string) => void;
  onUpdateMedia: (updated: CapturedMedia) => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  mediaList,
  onClose,
  onDeleteMedia,
  onUpdateMedia,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'all' | 'photos' | 'videos' | 'raw' | 'stacked'>('all');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showExif, setShowExif] = useState<boolean>(false);
  const [compareSplit, setCompareSplit] = useState<number>(50); // Split slider 0-100
  const [showCompare, setShowCompare] = useState<boolean>(false);

  // Edit adjustments state
  const [editExposure, setEditExposure] = useState<number>(0);
  const [editContrast, setEditContrast] = useState<number>(0);
  const [editSaturation, setEditSaturation] = useState<number>(0);
  const [editTemperature, setEditTemperature] = useState<number>(0);
  const [editTint, setEditTint] = useState<number>(0);
  const [editSharpen, setEditSharpen] = useState<number>(0);
  const [editRotation, setEditRotation] = useState<number>(0);
  const [editFlipH, setEditFlipH] = useState<boolean>(false);
  const [editFilter, setEditFilter] = useState<string>('natural');

  const filteredMedia = mediaList.filter((item) => {
    if (activeTab === 'photos') return item.type === 'photo';
    if (activeTab === 'videos') return item.type === 'video';
    if (activeTab === 'raw') return item.format.toLowerCase() === 'dng';
    if (activeTab === 'stacked') return !!item.exif.stackingInfo;
    return true;
  });

  const currentItem = filteredMedia[selectedIndex] || null;

  const handleNext = () => {
    if (selectedIndex < filteredMedia.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      resetEditControls();
    }
  };

  const handlePrev = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
      resetEditControls();
    }
  };

  const resetEditControls = () => {
    setEditExposure(0);
    setEditContrast(0);
    setEditSaturation(0);
    setEditTemperature(0);
    setEditTint(0);
    setEditSharpen(0);
    setEditRotation(0);
    setEditFlipH(false);
    setEditFilter('natural');
    setIsEditing(false);
    setShowCompare(false);
  };

  const toggleFavorite = () => {
    if (!currentItem) return;
    onUpdateMedia({
      ...currentItem,
      isFavorite: !currentItem.isFavorite,
    });
  };

  // Export / Download
  const handleExport = (format: 'jpg' | 'png' | 'webp' | 'dng') => {
    if (!currentItem) return;

    if (format === 'dng') {
      // Create high-res DNG binary export
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 1920;
        canvas.height = img.naturalHeight || 1080;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const dngBytes = createDngFile({
            width: canvas.width,
            height: canvas.height,
            rgbaData: imgData.data,
            cameraMake: 'Xiaomi',
            cameraModel: 'Redmi Note 15 4G',
            iso: currentItem.exif.iso,
            shutterSpeed: currentItem.exif.shutterSpeed,
            aperture: currentItem.exif.aperture,
          });
          downloadBinaryFile(dngBytes, `ProCam_${Date.now()}.dng`, 'image/x-adobe-dng');
        }
      };
      img.src = currentItem.url;
      return;
    }

    // Export as JPG / PNG / WebP
    const a = document.createElement('a');
    a.href = currentItem.url;
    a.download = `ProCam_${currentItem.timestamp}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // CSS transform for live editing
  const getComputedEditStyle = () => {
    const filterPreset = CAMERA_FILTERS.find((f) => f.id === editFilter);
    const filterCss = filterPreset && filterPreset.cssFilter !== 'none' ? filterPreset.cssFilter : '';

    return {
      filter: `${filterCss} brightness(${1 + editExposure * 0.01}) contrast(${1 + editContrast * 0.01}) saturate(${1 + editSaturation * 0.01}) hue-rotate(${editTint}deg)`,
      transform: `rotate(${editRotation}deg) scaleX(${editFlipH ? -1 : 1})`,
      transition: 'filter 0.15s ease, transform 0.2s ease',
    };
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col select-none overflow-hidden animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-950 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-800 transition active:scale-95"
            aria-label="Back to Camera"
          >
            <ChevronLeft className="w-6 h-6 text-neutral-300" />
          </button>
          <div>
            <h2 className="text-sm font-mono font-bold text-amber-400">PROCAM STUDIO & GALLERY</h2>
            <p className="text-[10px] text-neutral-400 font-mono">
              {filteredMedia.length} Captures • Redmi Note 15 4G
            </p>
          </div>
        </div>

        {/* Tab Filter Pills */}
        <div className="hidden sm:flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
          {(['all', 'photos', 'videos', 'raw', 'stacked'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedIndex(0);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-mono uppercase transition ${
                activeTab === tab
                  ? 'bg-amber-400 text-black font-bold shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area */}
      {filteredMedia.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-neutral-500">
          <p className="text-sm font-mono mb-2">No captures found in this album.</p>
          <p className="text-xs text-neutral-600">
            Switch back to the camera to take high-res photos, 60fps video, or astrophotography stacks.
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* Main Visualizer */}
          <div className="flex-1 relative flex items-center justify-center bg-neutral-950/80 p-2 overflow-hidden">
            {currentItem && (
              <div className="relative max-w-full max-h-[72vh] flex items-center justify-center">
                {showCompare && currentItem.type === 'photo' ? (
                  // Before / After Split Comparison Slider
                  <div className="relative max-w-full max-h-[72vh] overflow-hidden select-none border border-neutral-700 rounded-lg">
                    {/* Edited version underneath */}
                    <img
                      src={currentItem.url}
                      alt="Edited"
                      style={getComputedEditStyle()}
                      className="max-w-full max-h-[72vh] object-contain"
                    />
                    {/* Original version clipped on left */}
                    <div
                      className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-amber-400"
                      style={{ width: `${compareSplit}%` }}
                    >
                      <img
                        src={currentItem.url}
                        alt="Original"
                        className="max-w-none h-full object-contain"
                        style={{ width: '100%' }}
                      />
                      <span className="absolute top-2 left-2 text-[9px] bg-black/70 px-1.5 py-0.5 rounded font-mono text-white">
                        ORIGINAL
                      </span>
                    </div>
                    <span className="absolute top-2 right-2 text-[9px] bg-amber-400/90 text-black px-1.5 py-0.5 rounded font-mono font-bold">
                      PROCESSED
                    </span>

                    {/* Split Drag Range */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={compareSplit}
                      onChange={(e) => setCompareSplit(parseFloat(e.target.value))}
                      className="absolute bottom-2 inset-x-8 accent-amber-400 cursor-ew-resize opacity-80"
                    />
                  </div>
                ) : currentItem.type === 'video' ? (
                  <video
                    src={currentItem.url}
                    controls
                    autoPlay
                    loop
                    className="max-w-full max-h-[72vh] rounded-lg shadow-2xl"
                  />
                ) : (
                  <img
                    src={currentItem.url}
                    alt="Capture"
                    style={isEditing ? getComputedEditStyle() : {}}
                    className="max-w-full max-h-[72vh] object-contain rounded-lg shadow-2xl"
                  />
                )}

                {/* Stacking / RAW Badge */}
                {currentItem.exif.stackingInfo && (
                  <div className="absolute top-3 left-3 bg-amber-400 text-black px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shadow">
                    STACKED: {currentItem.exif.stackingInfo.frames} FRAMES (
                    {currentItem.exif.stackingInfo.algorithm.toUpperCase()})
                  </div>
                )}
                {currentItem.format.toLowerCase() === 'dng' && (
                  <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shadow">
                    RAW DNG 16-BIT
                  </div>
                )}
              </div>
            )}

            {/* Navigation arrows */}
            {selectedIndex > 0 && (
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-amber-400 hover:text-black transition"
                aria-label="Previous Media"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {selectedIndex < filteredMedia.length - 1 && (
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-amber-400 hover:text-black transition"
                aria-label="Next Media"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Right Editing Studio & EXIF Inspector Panel */}
          {(isEditing || showExif) && (
            <div className="w-full md:w-80 bg-neutral-900 border-l border-neutral-800 p-4 overflow-y-auto max-h-[75vh]">
              {showExif && currentItem && (
                <div className="flex flex-col gap-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-neutral-700 pb-2">
                    <span className="font-bold text-amber-400">EXIF METADATA</span>
                    <button
                      onClick={() => setShowExif(false)}
                      className="text-neutral-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="text-neutral-400">Camera:</div>
                    <div className="text-white font-semibold">{currentItem.exif.cameraMake} {currentItem.exif.cameraModel}</div>

                    <div className="text-neutral-400">Sensor:</div>
                    <div className="text-amber-300 font-semibold">{currentItem.exif.sensor}</div>

                    <div className="text-neutral-400">Aperture:</div>
                    <div className="text-white">{currentItem.exif.aperture}</div>

                    <div className="text-neutral-400">Shutter Speed:</div>
                    <div className="text-white">{currentItem.exif.shutterSpeed}</div>

                    <div className="text-neutral-400">ISO:</div>
                    <div className="text-white">{currentItem.exif.iso}</div>

                    <div className="text-neutral-400">Focal Length:</div>
                    <div className="text-white">{currentItem.exif.focalLength}</div>

                    <div className="text-neutral-400">Resolution:</div>
                    <div className="text-white">{currentItem.exif.resolution}</div>

                    <div className="text-neutral-400">Format:</div>
                    <div className="text-white uppercase">{currentItem.format}</div>

                    <div className="text-neutral-400">Date/Time:</div>
                    <div className="text-white">{currentItem.exif.date}</div>
                  </div>

                  {currentItem.exif.stackingInfo && (
                    <div className="bg-neutral-800 p-2.5 rounded-lg border border-amber-400/30 mt-2">
                      <div className="text-amber-300 font-bold mb-1">ASTRO STACK DETAILS</div>
                      <div className="text-[10px] text-neutral-300">
                        Frames Combined: {currentItem.exif.stackingInfo.frames}
                      </div>
                      <div className="text-[10px] text-neutral-300">
                        Algorithm: {currentItem.exif.stackingInfo.algorithm}
                      </div>
                      <div className="text-[10px] text-neutral-300">
                        Signal-to-Noise Ratio: +{Math.round(Math.sqrt(currentItem.exif.stackingInfo.frames) * 100)}%
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isEditing && (
                <div className="flex flex-col gap-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-neutral-700 pb-2">
                    <span className="font-bold text-amber-400">EDITING STUDIO</span>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="text-neutral-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sliders */}
                  <div className="flex flex-col gap-2.5">
                    <div>
                      <div className="flex justify-between text-[10px] text-neutral-300 mb-1">
                        <span>Exposure:</span>
                        <span>{editExposure}</span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={editExposure}
                        onChange={(e) => setEditExposure(parseInt(e.target.value, 10))}
                        className="w-full accent-amber-400 h-1 bg-neutral-800 rounded"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-neutral-300 mb-1">
                        <span>Contrast:</span>
                        <span>{editContrast}</span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={editContrast}
                        onChange={(e) => setEditContrast(parseInt(e.target.value, 10))}
                        className="w-full accent-amber-400 h-1 bg-neutral-800 rounded"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-neutral-300 mb-1">
                        <span>Saturation:</span>
                        <span>{editSaturation}</span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={editSaturation}
                        onChange={(e) => setEditSaturation(parseInt(e.target.value, 10))}
                        className="w-full accent-amber-400 h-1 bg-neutral-800 rounded"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-neutral-300 mb-1">
                        <span>Tint / Temperature:</span>
                        <span>{editTint}°</span>
                      </div>
                      <input
                        type="range"
                        min="-60"
                        max="60"
                        value={editTint}
                        onChange={(e) => setEditTint(parseInt(e.target.value, 10))}
                        className="w-full accent-amber-400 h-1 bg-neutral-800 rounded"
                      />
                    </div>

                    {/* Transform Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-neutral-800">
                      <button
                        onClick={() => setEditRotation((prev) => (prev + 90) % 360)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-xs font-mono transition"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        Rotate 90°
                      </button>
                      <button
                        onClick={() => setEditFlipH(!editFlipH)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-xs font-mono transition"
                      >
                        <FlipHorizontal className="w-3.5 h-3.5" />
                        Flip H
                      </button>
                    </div>

                    {/* Filter Presets in Studio */}
                    <div className="pt-2 border-t border-neutral-800">
                      <span className="text-[10px] text-neutral-400 mb-1.5 block">Preset LUT:</span>
                      <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto no-scrollbar">
                        {CAMERA_FILTERS.slice(0, 12).map((f) => (
                          <button
                            key={f.id}
                            onClick={() => setEditFilter(f.id)}
                            className={`p-1 text-[10px] rounded text-left truncate transition ${
                              editFilter === f.id
                                ? 'bg-amber-400 text-black font-bold'
                                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                            }`}
                          >
                            {f.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reset Button */}
                    <button
                      onClick={resetEditControls}
                      className="w-full py-1.5 mt-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs transition"
                    >
                      Revert All Changes
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bottom Action Footer */}
      {currentItem && (
        <div className="bg-neutral-950 border-t border-neutral-800 px-4 py-2 flex items-center justify-between text-xs">
          {/* Left quick actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-full transition active:scale-95 ${
                currentItem.isFavorite
                  ? 'text-red-500 fill-red-500'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Favorite"
            >
              <Heart className={`w-5 h-5 ${currentItem.isFavorite ? 'fill-red-500' : ''}`} />
            </button>

            <button
              onClick={() => {
                setShowExif(!showExif);
                setIsEditing(false);
              }}
              className={`p-2 rounded-full transition active:scale-95 ${
                showExif ? 'text-amber-400 bg-amber-400/20' : 'text-neutral-400 hover:text-white'
              }`}
              title="EXIF Information"
            >
              <Info className="w-5 h-5" />
            </button>

            {currentItem.type === 'photo' && (
              <>
                <button
                  onClick={() => {
                    setIsEditing(!isEditing);
                    setShowExif(false);
                  }}
                  className={`p-2 rounded-full transition active:scale-95 ${
                    isEditing ? 'text-amber-400 bg-amber-400/20' : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Editing Studio"
                >
                  <Sliders className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setShowCompare(!showCompare)}
                  className={`p-2 rounded-full transition active:scale-95 ${
                    showCompare ? 'text-amber-400 bg-amber-400/20' : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Before / After Split Slider"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Export / Download Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleExport('jpg')}
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 font-mono text-[11px] transition text-neutral-200"
            >
              JPG
            </button>
            <button
              onClick={() => handleExport('png')}
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 font-mono text-[11px] transition text-neutral-200"
            >
              PNG
            </button>
            <button
              onClick={() => handleExport('webp')}
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 font-mono text-[11px] transition text-neutral-200"
            >
              WebP
            </button>
            <button
              onClick={() => handleExport('dng')}
              className="px-2.5 py-1 rounded bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-[11px] transition shadow"
              title="Export as uncompressed Adobe DNG RAW"
            >
              RAW (DNG)
            </button>
          </div>

          {/* Delete Action */}
          <button
            onClick={() => {
              onDeleteMedia(currentItem.id);
              if (selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
            }}
            className="p-2 rounded-full text-neutral-500 hover:text-red-400 transition active:scale-95 ml-2"
            title="Delete Capture"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
