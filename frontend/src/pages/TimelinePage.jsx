import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Filter as FilterIcon, RefreshCw } from 'lucide-react';
import Chip from '../components/ui/Chip';
import Button from '../components/ui/Button';
import TimelineDayGroup from '../components/timeline/TimelineDayGroup';
import TimelineEmpty from '../components/timeline/TimelineEmpty';
import {
  format,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  parseISO,
} from 'date-fns';

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'analyzed', label: 'Analyzed' },
  { id: 'processing', label: 'Processing' },
  { id: 'queued', label: 'Queued' },
  { id: 'failed', label: 'Failed' },
];

const SOURCE_FILTERS = [
  { id: 'all', label: 'All sources' },
  { id: 'web', label: 'Web' },
  { id: 'telegram', label: 'Telegram' },
  { id: 'api', label: 'API' },
];

/** Group images by day and return sorted groups */
function groupByDay(images) {
  const groups = {};

  for (const img of images) {
    const date = img.uploaded_at ? parseISO(img.uploaded_at) : new Date();
    const dayKey = format(date, 'yyyy-MM-dd');

    if (!groups[dayKey]) {
      groups[dayKey] = { dayKey, date, images: [] };
    }
    groups[dayKey].images.push(img);
  }

  // Sort groups newest first
  return Object.values(groups).sort((a, b) => b.dayKey.localeCompare(a.dayKey));
}

/** Friendly label for a day */
function getDayLabel(date) {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return format(date, 'EEEE');
  if (isThisMonth(date)) return format(date, 'EEEE, MMM d');
  return format(date, 'MMM d, yyyy');
}

const TimelinePage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const fetchImages = async () => {
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await axios.get('http://localhost:8000/api/v1/images', { params });
      setImages(response.data.items || []);
    } catch (error) {
      console.error('Error fetching timeline:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchImages();
  }, [statusFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchImages();
  };

  // Client-side source filter
  const filteredImages = useMemo(() => {
    if (sourceFilter === 'all') return images;
    return images.filter((img) => img.source === sourceFilter);
  }, [images, sourceFilter]);

  const dayGroups = useMemo(() => groupByDay(filteredImages), [filteredImages]);

  // Stats
  const stats = useMemo(() => {
    const analyzed = images.filter((i) => i.status === 'analyzed').length;
    const processing = images.filter((i) => i.status === 'processing').length;
    return { total: images.length, analyzed, processing };
  }, [images]);

  return (
    <div className="space-y-6 max-w-[720px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-end justify-between"
      >
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-h1 font-medium text-fg-primary">Timeline</h1>
            {stats.processing > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning-soft text-warning-soft-fg text-[10px] font-medium"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
                {stats.processing} processing
              </motion.span>
            )}
          </div>
          <p className="text-small text-fg-tertiary">
            {stats.total} images · {stats.analyzed} analyzed
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          icon={<RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          Refresh
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-4 flex-wrap"
      >
        {/* Status filter */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <FilterIcon size={13} className="text-fg-tertiary flex-shrink-0" />
          {STATUS_FILTERS.map((f) => (
            <Chip
              key={f.id}
              active={statusFilter === f.id}
              onClick={() => setStatusFilter(f.id)}
            >
              {f.label}
            </Chip>
          ))}
        </div>

        <div className="w-[1px] h-4 bg-border hidden sm:block" />

        {/* Source filter */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {SOURCE_FILTERS.map((f) => (
            <Chip
              key={f.id}
              active={sourceFilter === f.id}
              onClick={() => setSourceFilter(f.id)}
            >
              {f.label}
            </Chip>
          ))}
        </div>
      </motion.div>

      {/* Timeline content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <TimelineSkeleton key="skeleton" />
        ) : dayGroups.length === 0 ? (
          <TimelineEmpty key="empty" />
        ) : (
          <motion.div
            key="timeline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            {/* Main timeline line */}
            <div className="absolute left-[11px] top-0 bottom-0 w-[1.5px] bg-border" />

            {dayGroups.map((group, idx) => (
              <TimelineDayGroup
                key={group.dayKey}
                label={getDayLabel(group.date)}
                date={format(group.date, 'MMM d, yyyy')}
                images={group.images}
                groupIndex={idx}
              />
            ))}

            {/* Timeline end cap */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: dayGroups.length * 0.12 + 0.2 }}
              className="flex items-center gap-3 pl-10 pt-2 pb-8 relative"
            >
              <div className="absolute left-[5px] top-[10px] w-[14px] h-[14px] rounded-full bg-surface-muted border-[1.5px] border-border flex items-center justify-center">
                <Clock size={8} className="text-fg-tertiary" />
              </div>
              <span className="text-[11px] text-fg-tertiary">
                Beginning of timeline
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/** Loading skeleton for the timeline */
const TimelineSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="relative"
  >
    <div className="absolute left-[11px] top-0 bottom-0 w-[1.5px] bg-border" />
    {[0, 1, 2, 3, 4].map((i) => (
      <div key={i} className="relative pl-10 pb-6">
        <div className="absolute left-[5px] top-[10px] w-[14px] h-[14px] rounded-full shimmer" />
        <div className="bg-surface rounded-lg border-[0.5px] border-border overflow-hidden">
          <div className="flex gap-0">
            <div className="w-[140px] h-[100px] shimmer flex-shrink-0" />
            <div className="flex-1 p-3 space-y-2">
              <div className="shimmer h-3 w-2/3 rounded-full" />
              <div className="shimmer h-2 w-full rounded-full" />
              <div className="shimmer h-2 w-1/2 rounded-full" />
              <div className="flex gap-1 pt-1">
                <div className="shimmer h-4 w-12 rounded-xs" />
                <div className="shimmer h-4 w-16 rounded-xs" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </motion.div>
);

export default TimelinePage;
