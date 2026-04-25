import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter as FilterIcon,
  LayoutGrid,
  Columns3,
  RefreshCw,
  Upload,
  Tag as TagIcon,
  FolderInput,
  Trash2,
  X,
  AlertCircle,
} from 'lucide-react';
import MasonryGrid from '../components/gallery/MasonryGrid';
import GalleryEmpty from '../components/gallery/GalleryEmpty';
import ImageDetailModal from '../components/gallery/ImageDetailModal';
import Chip from '../components/ui/Chip';
import Button from '../components/ui/Button';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'receipt', label: 'Receipts' },
  { id: 'screenshot', label: 'Screenshots' },
  { id: 'document', label: 'Documents' },
  { id: 'photo', label: 'Photos' },
];

const GalleryPage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [viewMode, setViewMode] = useState('masonry');
  const [refreshing, setRefreshing] = useState(false);
  const [detailId, setDetailId] = useState(null);

  const fetchImages = useCallback(async () => {
    setError(null);
    try {
      const response = await axios.get('/api/v1/images', {
        params: {
          category: activeCategory === 'all' ? undefined : activeCategory,
        },
      });
      setImages(response.data.items || []);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError('Failed to load images. Make sure the backend is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    setLoading(true);
    fetchImages();
  }, [fetchImages]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchImages();
  };

  const handleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === images.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(images.map((i) => i.id)));
    }
  }, [images, selectedIds.size]);

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} image(s)? This cannot be undone.`)) return;
    try {
      await Promise.all(
        [...selectedIds].map((id) => axios.delete(`/api/v1/images/${id}`))
      );
      setImages((prev) => prev.filter((i) => !selectedIds.has(i.id)));
      setSelectedIds(new Set());
    } catch {
      // ignore partial failures
    }
  };

  const handleImageDeleted = (id) => {
    setImages((prev) => prev.filter((i) => i.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Stats
  const stats = useMemo(() => {
    const analyzed = images.filter((i) => i.status === 'analyzed').length;
    const processing = images.filter((i) => i.status === 'processing').length;
    return { total: images.length, analyzed, processing };
  }, [images]);

  // Category counts (client-side)
  const categoryCounts = useMemo(() => {
    const counts = { all: images.length };
    for (const img of images) {
      if (img.category) {
        counts[img.category] = (counts[img.category] || 0) + 1;
      }
    }
    return counts;
  }, [images]);

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-end justify-between"
      >
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-h1 font-medium text-fg-primary">Gallery</h1>
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
          <p className="text-small text-fg-tertiary mt-0.5">
            {stats.total} images · {stats.analyzed} analyzed
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-surface-muted rounded-md p-0.5 border-[0.5px] border-border">
            <button
              onClick={() => setViewMode('masonry')}
              className={`p-1.5 rounded-sm transition-all duration-150 ${
                viewMode === 'masonry'
                  ? 'bg-surface shadow-e-1 text-fg-primary'
                  : 'text-fg-tertiary hover:text-fg-secondary'
              }`}
            >
              <Columns3 size={14} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-sm transition-all duration-150 ${
                viewMode === 'grid'
                  ? 'bg-surface shadow-e-1 text-fg-primary'
                  : 'text-fg-tertiary hover:text-fg-secondary'
              }`}
            >
              <LayoutGrid size={14} />
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* ── Filter Chips ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide"
      >
        <FilterIcon size={13} className="text-fg-tertiary mr-1 flex-shrink-0" />
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat.id}
            active={activeCategory === cat.id}
            onClick={() => setActiveCategory(cat.id)}
            count={
              activeCategory === cat.id
                ? categoryCounts[cat.id] || 0
                : undefined
            }
          >
            {cat.label}
          </Chip>
        ))}
      </motion.div>

      {/* ── Error State ────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-danger-soft/40 border-[0.5px] border-danger/20 rounded-lg p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-danger-soft flex items-center justify-center flex-shrink-0">
                <AlertCircle size={16} className="text-danger" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-medium text-danger-soft-fg">{error}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleRefresh}>
                Retry
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Content ────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {!loading && !error && images.length === 0 ? (
          <GalleryEmpty key="empty" />
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MasonryGrid
              images={images}
              loading={loading}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onOpen={(id) => setDetailId(id)}
              viewMode={viewMode}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bulk Action Bar ────────────────────────────────── */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-surface border-[0.5px] border-border rounded-lg shadow-e-3 px-3 py-2 flex items-center gap-2 z-50"
          >
            {/* Count badge */}
            <button
              onClick={handleSelectAll}
              className="bg-accent-soft text-accent-soft-fg px-2.5 py-1 rounded-md text-[11px] font-medium hover:brightness-95 transition-all"
              title={
                selectedIds.size === images.length
                  ? 'Deselect all'
                  : 'Select all'
              }
            >
              {selectedIds.size} selected
            </button>

            <div className="w-[1px] h-5 bg-border" />

            <Button
              variant="ghost"
              size="sm"
              icon={<TagIcon size={12} />}
              onClick={() => {}}
            >
              Tag
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<FolderInput size={12} />}
              onClick={() => {}}
            >
              Move
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 size={12} />}
              className="text-danger hover:bg-danger-soft/50"
              onClick={handleBulkDelete}
            >
              Delete
            </Button>

            <div className="w-[1px] h-5 bg-border" />

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedIds(new Set())}
              className="w-7 h-7 rounded-md flex items-center justify-center text-fg-tertiary hover:text-fg-primary hover:bg-surface-muted transition-colors"
            >
              <X size={14} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ── Image Detail Modal ─────────────────────────────── */}
      <ImageDetailModal
        imageId={detailId}
        images={images}
        onClose={() => setDetailId(null)}
        onDelete={handleImageDeleted}
        onNavigate={(id) => setDetailId(id)}
      />
    </div>
  );
};

export default GalleryPage;
