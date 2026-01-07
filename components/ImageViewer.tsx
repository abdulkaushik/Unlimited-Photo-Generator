import React, { useState, useRef, useEffect } from 'react';
import { Wallpaper } from '../types';
import { CloseIcon, DownloadIcon, RemixIcon, ZoomInIcon, ZoomOutIcon } from './Icons';

interface ImageViewerProps {
  wallpaper: Wallpaper | null;
  onClose: () => void;
  onRemix: (wallpaper: Wallpaper) => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ wallpaper, onClose, onRemix }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  // Refs for drag and pinch calculations
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartScaleRef = useRef<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset zoom when opening a new wallpaper
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [wallpaper]);

  if (!wallpaper) return null;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = wallpaper.url;
    link.download = `unlimited-photo-${wallpaper.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRemixClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemix(wallpaper);
  }

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(prev => {
        const newScale = Math.max(prev - 0.5, 1);
        if (newScale === 1) setPosition({ x: 0, y: 0 });
        return newScale;
    });
  };

  // --- Zoom Logic ---

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    // Desktop zoom with wheel
    const delta = e.deltaY * -0.002;
    const newScale = Math.min(Math.max(1, scale + delta), 4);
    
    // If returning to 1, reset position
    if (newScale === 1) setPosition({x:0, y:0});
    
    setScale(newScale);
  };

  // --- Touch/Pointer Logic for Pinch & Drag ---

  const getDistance = (p1: React.PointerEvent, p2: React.PointerEvent) => {
      // Not actually available directly in generic pointer events easily without tracking state of multiple pointers manually
      // Using TouchEvent logic manually via a specialized handler might be safer, 
      // but let's stick to standard PointerEvents if possible, or simple TouchEvents for the pinch.
      // Actually, React's onTouchMove gives us access to e.touches list.
      return 0;
  };
  
  // We will use native touch events for pinch to access the list of active touches easily
  const handleTouchStart = (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
          const dist = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
          );
          pinchStartDistRef.current = dist;
          pinchStartScaleRef.current = scale;
      }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      if (e.touches.length === 2 && pinchStartDistRef.current) {
          e.stopPropagation();
          const dist = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
          );
          const newScale = pinchStartScaleRef.current * (dist / pinchStartDistRef.current);
          setScale(Math.min(Math.max(1, newScale), 4));
      }
  };
  
  const handleTouchEnd = () => {
      pinchStartDistRef.current = null;
  };

  // --- Drag Logic ---

  const handlePointerDown = (e: React.PointerEvent) => {
    if (scale > 1) {
      e.stopPropagation(); 
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging && dragStartRef.current && scale > 1) {
        e.stopPropagation();
        e.preventDefault();
        setPosition({
            x: e.clientX - dragStartRef.current.x,
            y: e.clientY - dragStartRef.current.y
        });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
        e.stopPropagation();
        setIsDragging(false);
        dragStartRef.current = null;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden touch-none"
      onClick={onClose}
      onWheel={handleWheel}
    >
      
      {/* Top Controls - Close Button */}
      <div className="absolute top-0 right-0 p-4 z-30 pointer-events-none">
        <button 
          onClick={onClose}
          className="pointer-events-auto p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all active:scale-95 group"
          aria-label="Close"
        >
          <CloseIcon className="w-6 h-6 group-hover:rotate-90 transition-transform" />
        </button>
      </div>

      {/* Main Image Container */}
      <div 
        className="relative w-full h-full flex items-center justify-center overflow-hidden z-10"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
            ref={containerRef}
            style={{ 
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                transition: (isDragging || pinchStartDistRef.current) ? 'none' : 'transform 0.2s ease-out'
            }}
            className="flex items-center justify-center origin-center will-change-transform"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onClick={(e) => e.stopPropagation()}
        >
            <img
            src={wallpaper.url}
            alt={wallpaper.prompt}
            className="max-h-[80vh] md:max-h-[85vh] max-w-[95vw] md:max-w-[85vw] rounded-lg shadow-2xl object-contain select-none"
            draggable={false}
            />
        </div>
      </div>

      {/* Zoom Controls */}
      <div 
        className="absolute bottom-32 right-4 flex flex-col gap-2 z-30 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleZoomIn} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20">
            <ZoomInIcon className="w-6 h-6" />
        </button>
        <button onClick={handleZoomOut} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20">
            <ZoomOutIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Actions */}
      <div 
        className="absolute bottom-0 left-0 right-0 p-6 z-20 bg-gradient-to-t from-black/90 via-black/60 to-transparent pb-10 md:pb-12"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-lg mx-auto w-full">
           <p className="text-white/70 text-sm mb-4 line-clamp-2 px-1 font-light italic text-center drop-shadow-md">
             "{wallpaper.prompt}"
           </p>
           
           <div className="flex gap-3">
             <button
               onClick={handleDownload}
               className="flex-1 bg-white text-black font-semibold h-12 rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition-transform active:scale-95 shadow-lg"
             >
               <DownloadIcon className="w-5 h-5" />
               Download
             </button>
             
             <button
               onClick={handleRemixClick}
               className="flex-1 bg-white/10 backdrop-blur-md border border-white/10 text-white font-semibold h-12 rounded-xl flex items-center justify-center gap-2 hover:bg-white/20 transition-transform active:scale-95 shadow-lg"
             >
               <RemixIcon className="w-5 h-5" />
               Remix
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;