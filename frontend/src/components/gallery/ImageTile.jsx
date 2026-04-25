import React, { useState } from 'react';
import { MoreHorizontal, ArrowUpRight, Heart, Check } from 'lucide-react';
import { cn } from '../ui/Button';
import Tag from '../ui/Tag';
import { formatDistanceToNow } from 'date-fns';

const ImageTile = ({ image, selected, selectionMode, onSelect, onOpen }) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusColors = {
    analyzed: 'bg-success',
    processing: 'bg-warning',
    failed: 'bg-danger',
    queued: 'bg-fg-tertiary',
  };

  return (
    <div 
      className={cn(
        'group relative bg-surface rounded-lg border-[0.5px] border-border overflow-hidden transition-all duration-160 ease-out break-inside-avoid mb-3',
        isHovered ? 'translate-y-[-2px] border-border-strong shadow-e-1' : ''
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => selectionMode ? onSelect(image.id) : onOpen(image.id)}
    >
      {/* Image Area */}
      <div className="relative overflow-hidden cursor-pointer">
        <img 
          src={image.thumbnailUrl || `http://localhost:8000/uploads/${image.storage_key}`}
          alt={image.filename}
          className={cn(
            'w-full h-auto block transition-transform duration-700',
            isHovered ? 'scale-[1.02]' : ''
          )}
          style={{ aspectRatio: `${image.width}/${image.height}` }}
        />
        
        {/* Shimmer for processing */}
        {image.status === 'processing' && (
          <div className="absolute inset-0 shimmer opacity-30" />
        )}

        {/* Confidence Badge */}
        {image.status === 'analyzed' && (
          <div className="absolute bottom-2 left-2 bg-surface/95 backdrop-blur-md rounded-xs px-[6px] py-[2px] flex items-center gap-1.5 border-[0.5px] border-border">
            <div className="w-[5px] h-[5px] rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] font-medium text-accent-soft-fg tabular-nums">
              {image.ai_confidence ? `${Math.round(image.ai_confidence)}%` : '94%'}
            </span>
          </div>
        )}

        {/* Overlay Actions */}
        <div className={cn(
          'absolute top-2 right-2 flex gap-1 transition-opacity duration-120',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}>
          <button className="w-6 h-6 rounded-sm bg-surface/95 backdrop-blur-md border-[0.5px] border-border flex items-center justify-center hover:bg-surface transition-colors">
            <Heart size={12} className="text-fg-secondary" />
          </button>
          <button className="w-6 h-6 rounded-sm bg-surface/95 backdrop-blur-md border-[0.5px] border-border flex items-center justify-center hover:bg-surface transition-colors">
            <ArrowUpRight size={12} className="text-fg-secondary" />
          </button>
          <button className="w-6 h-6 rounded-sm bg-surface/95 backdrop-blur-md border-[0.5px] border-border flex items-center justify-center hover:bg-surface transition-colors">
            <MoreHorizontal size={12} className="text-fg-secondary" />
          </button>
        </div>

        {/* Selection Checkbox */}
        {(isHovered || selectionMode || selected) && (
          <div 
            className="absolute top-2 left-2"
            onClick={(e) => { e.stopPropagation(); onSelect(image.id); }}
          >
            <div className={cn(
              'w-5 h-5 rounded-xs border-[0.5px] border-border flex items-center justify-center transition-colors',
              selected ? 'bg-accent border-accent' : 'bg-surface/95'
            )}>
              {selected && <Check size={12} className="text-white" strokeWidth={3} />}
            </div>
          </div>
        )}
      </div>

      {/* Meta Strip */}
      <div className="border-t-[0.5px] border-border p-[10px_12px] flex items-center gap-2">
        <div className={cn('w-[6px] h-[6px] rounded-full flex-shrink-0', statusColors[image.status])} />
        <span className="text-[12px] font-medium text-fg-primary truncate flex-1">{image.filename}</span>
        <span className="text-[11px] text-fg-tertiary tabular-nums">
          {image.uploaded_at ? formatDistanceToNow(new Date(image.uploaded_at), { addSuffix: false }) : '2m'}
        </span>
      </div>

      {/* Tag Row */}
      {image.tags && image.tags.length > 0 && (
        <div className="px-[12px] pb-[10px] flex flex-wrap gap-1">
          {image.tags.slice(0, 3).map((tag, idx) => (
            <Tag key={tag.id || idx} tone={idx === 0 ? 'accent' : idx === 1 ? 'success' : 'warning'} size="xs">
              {tag.label}
            </Tag>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageTile;
