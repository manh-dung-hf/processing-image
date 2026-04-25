import React, { useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import ImageTile from './ImageTile';

// Pre-computed skeleton heights to avoid Math.random() in render
const SKELETON_HEIGHTS = [220, 180, 260, 200, 240, 190, 250, 210, 230, 195, 270, 185];

const MasonryGrid = ({ images, selectedIds, onSelect, onOpen, loading, viewMode = 'masonry' }) => {
  const columnClass = useMemo(() => {
    if (viewMode === 'grid') {
      return 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3';
    }
    return 'columns-2 md:columns-3 xl:columns-4 2xl:columns-5 gap-[12px]';
  }, [viewMode]);

  if (loading) {
    return (
      <div className={columnClass}>
        {SKELETON_HEIGHTS.map((h, i) => (
          <div
            key={i}
            className="break-inside-avoid mb-3 bg-surface rounded-lg border-[0.5px] border-border overflow-hidden"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div
              className="shimmer w-full"
              style={{ height: viewMode === 'grid' ? 200 : h }}
            />
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
    return null;
  }

  return (
    <div className={columnClass}>
      <AnimatePresence mode="popLayout">
        {images.map((image, idx) => (
          <ImageTile
            key={image.id}
            image={image}
            index={idx}
            selected={selectedIds.has(image.id)}
            selectionMode={selectedIds.size > 0}
            onSelect={onSelect}
            onOpen={onOpen}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default MasonryGrid;
