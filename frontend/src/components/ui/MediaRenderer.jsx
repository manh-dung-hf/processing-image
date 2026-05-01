import React, { useState } from 'react';
import { Play, Film } from 'lucide-react';
import { cn } from './Button';

/**
 * Renders either an <img> or <video> based on media_type.
 * Shows a play icon overlay for videos.
 */
const MediaRenderer = ({
  item,
  className = '',
  imgClassName = '',
  showPlayIcon = true,
  autoPlay = false,
  controls = false,
  muted = true,
  onLoad,
}) => {
  const [loaded, setLoaded] = useState(false);
  const isVideo = item.media_type === 'video';

  const src = item.thumbnailUrl || `/uploads/${item.storage_key}`;
  const thumbSrc = item.thumbnail_key ? `/uploads/${item.thumbnail_key}` : null;

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  if (isVideo) {
    if (autoPlay || controls) {
      // Full video player
      return (
        <div className={cn('relative', className)}>
          <video
            src={src}
            poster={thumbSrc || undefined}
            controls={controls}
            autoPlay={autoPlay}
            muted={muted}
            loop
            playsInline
            className={cn('w-full h-full object-cover', imgClassName)}
            onLoadedData={handleLoad}
          />
        </div>
      );
    }

    // Thumbnail mode with play overlay
    return (
      <div className={cn('relative', className)}>
        {thumbSrc ? (
          <img
            src={thumbSrc}
            alt={item.filename}
            className={cn('w-full h-auto block', imgClassName)}
            style={{ aspectRatio: `${item.width || 16}/${item.height || 9}` }}
            onLoad={handleLoad}
          />
        ) : (
          <div
            className={cn('w-full bg-surface-sunken flex items-center justify-center', imgClassName)}
            style={{ aspectRatio: `${item.width || 16}/${item.height || 9}` }}
          >
            <Film size={24} className="text-fg-tertiary" />
          </div>
        )}

        {showPlayIcon && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-fg-primary/70 backdrop-blur-sm flex items-center justify-center">
              <Play size={18} className="text-white ml-0.5" fill="white" />
            </div>
          </div>
        )}

        {/* Duration badge */}
        {item.duration && (
          <div className="absolute bottom-2 right-2 bg-fg-primary/75 backdrop-blur-sm rounded px-1.5 py-0.5 text-[10px] font-mono text-white tabular-nums">
            {formatDuration(item.duration)}
          </div>
        )}
      </div>
    );
  }

  // Image
  return (
    <img
      src={src}
      alt={item.filename}
      className={cn('w-full h-auto block', imgClassName, className)}
      style={{ aspectRatio: `${item.width || 4}/${item.height || 3}` }}
      onLoad={handleLoad}
    />
  );
};

function formatDuration(seconds) {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default MediaRenderer;
