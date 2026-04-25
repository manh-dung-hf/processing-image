import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Sparkles, AlertCircle, Clock, ArrowUpRight } from 'lucide-react';
import { cn } from '../ui/Button';
import Tag from '../ui/Tag';
import { formatDistanceToNow } from 'date-fns';

const statusConfig = {
  analyzed: { icon: Sparkles, color: 'bg-success', label: 'Analyzed', tone: 'text-success' },
  processing: { icon: Clock, color: 'bg-warning', label: 'Processing', tone: 'text-warning' },
  failed: { icon: AlertCircle, color: 'bg-danger', label: 'Failed', tone: 'text-danger' },
  queued: { icon: Clock, color: 'bg-fg-tertiary', label: 'Queued', tone: 'text-fg-tertiary' },
};

const TimelineCard = ({ image, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const status = statusConfig[image.status] || statusConfig.queued;
  const StatusIcon = status.icon;

  const formatSize = (bytes) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1]
      }}
      className="relative pl-10 pb-8 group"
    >
      {/* Timeline connector line */}
      <div className="absolute left-[11px] top-6 bottom-0 w-[1.5px] bg-border group-last:hidden" />

      {/* Timeline dot */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, delay: index * 0.08 + 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-[5px] top-[10px]"
      >
        <div className={cn(
          'w-[14px] h-[14px] rounded-full border-2 border-surface flex items-center justify-center',
          status.color
        )}>
          <div className="w-[6px] h-[6px] rounded-full bg-white" />
        </div>
      </motion.div>

      {/* Card */}
      <div
        className={cn(
          'bg-surface rounded-lg border-[0.5px] border-border overflow-hidden transition-all duration-200',
          isHovered ? 'border-border-strong shadow-e-2 translate-y-[-1px]' : 'shadow-e-1'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex gap-0">
          {/* Thumbnail */}
          <div className="relative w-[140px] min-h-[100px] flex-shrink-0 overflow-hidden bg-surface-sunken">
            <img
              src={image.thumbnailUrl || `/uploads/${image.storage_key}`}
              alt={image.filename}
              className={cn(
                'w-full h-full object-cover transition-transform duration-500',
                isHovered ? 'scale-[1.05]' : ''
              )}
            />
            {image.status === 'processing' && (
              <div className="absolute inset-0 shimmer opacity-30" />
            )}

            {/* Hover overlay */}
            <div className={cn(
              'absolute inset-0 bg-fg-primary/40 flex items-center justify-center transition-opacity duration-200',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}>
              <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                <Eye size={14} className="text-fg-primary" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
            <div>
              {/* Header row */}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h4 className="text-[13px] font-medium text-fg-primary truncate">{image.filename}</h4>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'flex-shrink-0 w-6 h-6 rounded-sm bg-surface-muted flex items-center justify-center transition-opacity duration-150',
                    isHovered ? 'opacity-100' : 'opacity-0'
                  )}
                >
                  <ArrowUpRight size={12} className="text-fg-secondary" />
                </motion.button>
              </div>

              {/* AI Summary */}
              {image.ai_summary && (
                <p className="text-[11px] text-fg-secondary leading-relaxed line-clamp-2 mb-2">
                  {image.ai_summary}
                </p>
              )}

              {/* Tags */}
              {image.tags && image.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {image.tags.slice(0, 4).map((tag, idx) => (
                    <Tag key={tag.id || idx} tone={tag.tone || 'gray'} size="xs">
                      {tag.label}
                    </Tag>
                  ))}
                  {image.tags.length > 4 && (
                    <span className="text-[10px] text-fg-tertiary self-center ml-0.5">
                      +{image.tags.length - 4}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Footer meta */}
            <div className="flex items-center gap-3 text-[11px] text-fg-tertiary">
              <span className={cn('flex items-center gap-1 font-medium', status.tone)}>
                <StatusIcon size={10} />
                {status.label}
              </span>
              <span className="w-[3px] h-[3px] rounded-full bg-border-strong" />
              <span>{formatSize(image.size_bytes)}</span>
              <span className="w-[3px] h-[3px] rounded-full bg-border-strong" />
              <span className="tabular-nums">
                {image.uploaded_at
                  ? formatDistanceToNow(new Date(image.uploaded_at), { addSuffix: true })
                  : 'just now'}
              </span>
              {image.source && (
                <>
                  <span className="w-[3px] h-[3px] rounded-full bg-border-strong" />
                  <span className="capitalize">{image.source}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TimelineCard;
