import React, { useState } from 'react';
import { Wallpaper, GenerationGroup } from '../types';
import { CopyIcon, CheckIcon } from './Icons';

interface WallpaperGridProps {
  generations: GenerationGroup[];
  onSelect: (wallpaper: Wallpaper) => void;
}

const GenerationItem: React.FC<{ group: GenerationGroup; onSelect: (w: Wallpaper) => void }> = ({ group, onSelect }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(group.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Chat Prompt Bubble */}
      <div className="flex justify-end mb-4 px-2">
        <div className="bg-secondary/60 border border-white/10 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] md:max-w-[70%] relative group">
          <p className="text-white/90 text-sm md:text-base leading-relaxed">{group.prompt}</p>
          <button 
            onClick={handleCopy}
            className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-primary transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            title="Copy prompt"
          >
            {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Images Grid or Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {group.status === 'loading' ? (
          // Skeletons - Showing 2 since we generate 2 images
          Array.from({ length: 2 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              // Use inline style for aspect-ratio matching the requested ratio
              style={{ aspectRatio: group.aspectRatio.replace(':', '/') }}
              className="relative rounded-xl overflow-hidden bg-secondary animate-pulse border border-white/5"
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                 <div className="w-8 h-8 rounded-full bg-white/30" />
              </div>
            </div>
          ))
        ) : (
          // Loaded Images
          group.wallpapers.map((wp) => (
            <div
              key={wp.id}
              onClick={() => onSelect(wp)}
              style={{ aspectRatio: wp.aspectRatio?.replace(':', '/') || '9/16' }}
              className="relative rounded-xl overflow-hidden cursor-pointer group shadow-lg border border-white/5 bg-secondary/50 transition-transform active:scale-95 w-full"
            >
              <img
                src={wp.url}
                alt={wp.prompt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
          ))
        )}
      </div>

      {group.status === 'error' && (
        <div className="flex flex-col items-center justify-center py-6 px-4 bg-red-500/10 border border-red-500/20 rounded-xl mt-2">
          <p className="text-red-400 font-medium text-sm text-center mb-1">Generation Failed</p>
          <p className="text-red-400/70 text-xs text-center">{group.errorMessage || "An unexpected error occurred."}</p>
        </div>
      )}
    </div>
  );
};

const WallpaperGrid: React.FC<WallpaperGridProps> = ({ generations, onSelect }) => {
  if (generations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-white/40 py-20 min-h-[50vh]">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
           <CopyIcon className="w-8 h-8 opacity-50" />
        </div>
        <p className="text-lg font-medium">No creations yet.</p>
        <p className="text-sm">Type a prompt to start generating.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      {generations.map((group) => (
        <GenerationItem key={group.id} group={group} onSelect={onSelect} />
      ))}
    </div>
  );
};

export default WallpaperGrid;