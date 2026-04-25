import React, { useState } from 'react';
import { Plus, Minus, RotateCcw, Maximize2 } from 'lucide-react';
import { cn } from '../ui/Button';

const ImageHero = ({ image, onZoomIn, onZoomOut, onRotate, onFullscreen }) => {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
    if (onRotate) onRotate();
  };

  return (
    <div className="bg-surface rounded-lg border-[0.5px] border-border p-[14px] relative group">
      <div className="bg-surface-sunken rounded-md overflow-hidden flex items-center justify-center min-h-[400px] max-h-[70vh]">
        <img 
          src={image.fileUrl || `/uploads/${image.storage_key}`} 
          alt={image.filename}
          className="max-w-full max-h-full object-contain transition-transform duration-300 ease-spring"
          style={{ 
            transform: `rotate(${rotation}deg) scale(${zoom})`,
            aspectRatio: `${image.width}/${image.height}`
          }}
        />
      </div>

      {/* Floating Controls */}
      <div className="absolute bottom-[18px] right-[18px] bg-surface/95 backdrop-blur-md border-[0.5px] border-border rounded-md p-1 flex gap-[2px] shadow-e-2 transition-opacity duration-160 opacity-0 group-hover:opacity-100">
        <button 
          onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))}
          className="w-7 h-7 rounded-sm flex items-center justify-center hover:bg-surface-muted text-fg-secondary hover:text-fg-primary transition-colors"
        >
          <Plus size={14} />
        </button>
        <button 
          onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))}
          className="w-7 h-7 rounded-sm flex items-center justify-center hover:bg-surface-muted text-fg-secondary hover:text-fg-primary transition-colors"
        >
          <Minus size={14} />
        </button>
        <button 
          onClick={handleRotate}
          className="w-7 h-7 rounded-sm flex items-center justify-center hover:bg-surface-muted text-fg-secondary hover:text-fg-primary transition-colors"
        >
          <RotateCcw size={14} />
        </button>
        <button 
          onClick={onFullscreen}
          className="w-7 h-7 rounded-sm flex items-center justify-center hover:bg-surface-muted text-fg-secondary hover:text-fg-primary transition-colors"
        >
          <Maximize2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default ImageHero;
