import React from 'react';
import ImageTile from './ImageTile';
import Skeleton from '../ui/Skeleton';

const MasonryGrid = ({ images, selectedIds, onSelect, onOpen, loading }) => {
  if (loading) {
    return (
      <div className="columns-2 md:columns-3 xl:columns-4 2xl:columns-5 gap-[12px]">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="break-inside-avoid mb-3 bg-surface rounded-lg border-[0.5px] border-border overflow-hidden">
             <div className="shimmer w-full" style={{ height: `${180 + Math.random() * 100}px` }} />
             <div className="p-3 space-y-2">
               <div className="shimmer h-3 w-2/3 rounded-full" />
               <div className="flex gap-1">
                 <div className="shimmer h-4 w-12 rounded-xs" />
                 <div className="shimmer h-4 w-12 rounded-xs" />
               </div>
             </div>
          </div>
        ))}
      </div>
    );
  }

  if (!images || images.length === 0) {
    return null; // Handle empty state in parent
  }

  return (
    <div className="columns-2 md:columns-3 xl:columns-4 2xl:columns-5 gap-[12px]">
      {images.map((image) => (
        <ImageTile
          key={image.id}
          image={image}
          selected={selectedIds.has(image.id)}
          selectionMode={selectedIds.size > 0}
          onSelect={onSelect}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
};

export default MasonryGrid;
