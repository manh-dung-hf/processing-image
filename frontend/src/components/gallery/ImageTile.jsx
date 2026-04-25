import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, ArrowUpRight, Heart, Check, Sparkles, Eye } from 'lucide-react';
import { cn } from '../ui/Button';
import Tag from '../ui/Tag';
import { formatDistanceToNow } from 'date-fns';

const statusColors = {
  analyzed: 'bg-success',
  processing: 'bg-warning',
  failed: 'bg-danger',
  queued: 'bg-fg-tertiary',
};

const ImageTile = ({ image, selected, selectionMode, onSelect, onOpen, index = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.45,
        delay: index * 0.04,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(
        'group relative bg-surface rounded-lg border-[0.5px] overflow-hidden transition-all duration-200 ease-out break-inside-avoid mb-3',
        selected
          ? 'border-accent shadow-e-2 ring-2 ring-accent/20'
          : isHovered
            ? 'border-border-strong shadow-e-2 translate-y-[-2px]'
            : 'border-border'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => (selectionMode ? onSelect(image.id) : onOpen(image.id))}
    >
      {/* ── Image Area ─────────────────────────────────────── */}
      <div className="relative overflow-hidden cursor-pointer bg-surface-sunken">
        {/* Placeholder shimmer until loaded */}
        {!imgLoaded && (
          <div
            className="shimmer w-full"
            style={{ aspectRatio: `${image.width || 4}/${image.height || 3}` }}
          />
        )}

        <img
          src={image.thumbnailUrl || `/uploads/${image.storage_key}`}
          alt={image.filename}
          onLoad={() => setImgLoaded(true)}
          className={cn(
            'w-full h-auto block transition-transform duration-500',
            isHovered ? 'scale-[1.03]' : '',
            imgLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
          )}
          style={{ aspectRatio: `${image.width || 4}/${image.height || 3}` }}
        />

        {/* Processing shimmer overlay */}
        {image.status === 'processing' && (
          <div className="absolute inset-0 shimmer opacity-25 pointer-events-none" />
        )}

        {/* Confidence badge */}
        {image.status === 'analyzed' && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute bottom-2 left-2 bg-surface/90 backdrop-blur-md rounded-xs px-[7px] py-[3px] flex items-center gap-1.5 border-[0.5px] border-border"
          >
            <Sparkles size={9} className="text-accent" />
            <span className="text-[10px] font-medium text-accent-soft-fg tabular-nums">
              {image.ai_confidence ? `${Math.round(image.ai_confidence)}%` : '—'}
            </span>
          </motion.div>
        )}

        {/* Hover overlay with view button */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-t from-fg-primary/30 via-transparent to-transparent transition-opacity duration-200 pointer-events-none',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        />

        {/* Top-right action buttons */}
        <div
          className={cn(
            'absolute top-2 right-2 flex gap-1 transition-all duration-150',
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
          )}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="w-6 h-6 rounded-sm bg-surface/90 backdrop-blur-md border-[0.5px] border-border flex items-center justify-center hover:bg-surface transition-colors"
          >
            <Heart size={11} className="text-fg-secondary" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onOpen(image.id);
            }}
            className="w-6 h-6 rounded-sm bg-surface/90 backdrop-blur-md border-[0.5px] border-border flex items-center justify-center hover:bg-surface transition-colors"
          >
            <ArrowUpRight size={11} className="text-fg-secondary" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="w-6 h-6 rounded-sm bg-surface/90 backdrop-blur-md border-[0.5px] border-border flex items-center justify-center hover:bg-surface transition-colors"
          >
            <MoreHorizontal size={11} className="text-fg-secondary" />
          </motion.button>
        </div>

        {/* Selection checkbox */}
        {(isHovered || selectionMode || selected) && (
          <div
            className="absolute top-2 left-2"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(image.id);
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'w-5 h-5 rounded-xs border-[1px] flex items-center justify-center transition-colors',
                selected
                  ? 'bg-accent border-accent'
                  : 'bg-surface/90 backdrop-blur-md border-border hover:border-border-strong'
              )}
            >
              {selected && <Check size={11} className="text-white" strokeWidth={3} />}
            </motion.div>
          </div>
        )}
      </div>

      {/* ── Meta Strip ─────────────────────────────────────── */}
      <div className="border-t-[0.5px] border-border p-[10px_12px] flex items-center gap-2">
        <div
          className={cn(
            'w-[6px] h-[6px] rounded-full flex-shrink-0 transition-colors',
            statusColors[image.status],
            image.status === 'processing' && 'animate-pulse'
          )}
        />
        <span className="text-[12px] font-medium text-fg-primary truncate flex-1">
          {image.filename}
        </span>
        <span className="text-[11px] text-fg-tertiary tabular-nums flex-shrink-0">
          {image.uploaded_at
            ? formatDistanceToNow(new Date(image.uploaded_at), { addSuffix: false })
            : '—'}
        </span>
      </div>

      {/* ── Tag Row ────────────────────────────────────────── */}
      {image.tags && image.tags.length > 0 && (
        <div className="px-[12px] pb-[10px] flex flex-wrap gap-1">
          {image.tags.slice(0, 3).map((tag, idx) => (
            <Tag key={tag.id || idx} tone={tag.tone || 'gray'} size="xs">
              {tag.label}
            </Tag>
          ))}
          {image.tags.length > 3 && (
            <span className="text-[10px] text-fg-tertiary self-center">
              +{image.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default ImageTile;
