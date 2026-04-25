import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  X, Download, Trash2, Copy, Check, Sparkles, FileText,
  Clock, Tag as TagIcon, Loader2, ExternalLink,
  Plus, Minus, RotateCcw, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '../ui/Button';
import Button from '../ui/Button';
import Tag from '../ui/Tag';

const ImageDetailModal = ({ imageId, images, onClose, onDelete, onNavigate }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const currentIndex = images?.findIndex((i) => i.id === imageId) ?? -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < (images?.length ?? 0) - 1;

  useEffect(() => {
    if (!imageId) return;
    setLoading(true);
    setZoom(1);
    setRotation(0);
    axios
      .get(`/api/v1/images/${imageId}`)
      .then((r) => setDetail(r.data))
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [imageId]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onNavigate(images[currentIndex - 1].id);
      if (e.key === 'ArrowRight' && hasNext) onNavigate(images[currentIndex + 1].id);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [hasPrev, hasNext, currentIndex, images, onClose, onNavigate]);

  const handleCopyOCR = () => {
    if (detail?.ocr_text) {
      navigator.clipboard.writeText(detail.ocr_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this image? This action cannot be undone.')) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/v1/images/${imageId}`);
      onDelete(imageId);
      onClose();
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  };

  const img = detail || images?.find((i) => i.id === imageId);

  return (
    <AnimatePresence>
      {imageId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-fg-primary/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative m-auto bg-canvas rounded-2xl shadow-e-3 border border-border overflow-hidden flex max-w-[1100px] w-[95vw] max-h-[90vh]"
          >
            {/* Left — Image viewer */}
            <div className="flex-1 bg-surface-sunken flex flex-col min-w-0">
              {/* Image */}
              <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
                {loading ? (
                  <Loader2 size={24} className="animate-spin text-fg-tertiary" />
                ) : img?.storage_key ? (
                  <img
                    src={`/uploads/${img.storage_key}`}
                    alt={img.filename}
                    className="max-w-full max-h-full object-contain transition-transform duration-300"
                    style={{ transform: `rotate(${rotation}deg) scale(${zoom})` }}
                  />
                ) : (
                  <p className="text-fg-tertiary text-[13px]">Image not available</p>
                )}

                {/* Nav arrows */}
                {hasPrev && (
                  <button
                    onClick={() => onNavigate(images[currentIndex - 1].id)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface/90 border border-border flex items-center justify-center text-fg-secondary hover:text-fg-primary transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                )}
                {hasNext && (
                  <button
                    onClick={() => onNavigate(images[currentIndex + 1].id)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface/90 border border-border flex items-center justify-center text-fg-secondary hover:text-fg-primary transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>

              {/* Zoom controls */}
              <div className="flex items-center justify-center gap-1 p-2 border-t border-border bg-surface/50">
                <button onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))} className="w-7 h-7 rounded-md flex items-center justify-center text-fg-tertiary hover:text-fg-primary hover:bg-surface-muted transition-colors">
                  <Minus size={14} />
                </button>
                <span className="text-[11px] text-fg-tertiary tabular-nums w-10 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom((z) => Math.min(z + 0.25, 3))} className="w-7 h-7 rounded-md flex items-center justify-center text-fg-tertiary hover:text-fg-primary hover:bg-surface-muted transition-colors">
                  <Plus size={14} />
                </button>
                <div className="w-px h-4 bg-border mx-1" />
                <button onClick={() => setRotation((r) => (r + 90) % 360)} className="w-7 h-7 rounded-md flex items-center justify-center text-fg-tertiary hover:text-fg-primary hover:bg-surface-muted transition-colors">
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Right — Info panel */}
            <div className="w-[340px] flex-shrink-0 border-l border-border bg-surface flex flex-col overflow-y-auto">
              {/* Header */}
              <div className="p-4 border-b border-border flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-[14px] font-medium text-fg-primary truncate">{img?.filename}</h3>
                  <p className="text-[11px] text-fg-tertiary mt-0.5">
                    {img?.uploaded_at ? format(new Date(img.uploaded_at), 'MMM d, yyyy · h:mm a') : '—'}
                  </p>
                </div>
                <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center text-fg-tertiary hover:text-fg-primary hover:bg-surface-muted transition-colors flex-shrink-0 ml-2">
                  <X size={15} />
                </button>
              </div>

              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 size={18} className="animate-spin text-fg-tertiary" />
                </div>
              ) : detail ? (
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  {/* Status & meta */}
                  <div className="grid grid-cols-2 gap-2">
                    <MetaItem label="Status" value={detail.status} badge={detail.status === 'analyzed' ? 'success' : detail.status === 'failed' ? 'danger' : 'warning'} />
                    <MetaItem label="Category" value={detail.category || '—'} />
                    <MetaItem label="Source" value={detail.source} />
                    <MetaItem label="Size" value={formatBytes(detail.size_bytes)} />
                    <MetaItem label="Dimensions" value={`${detail.width}×${detail.height}`} />
                    <MetaItem label="Type" value={detail.content_type} />
                  </div>

                  {/* AI Summary */}
                  {detail.ai_summary && (
                    <Section icon={<Sparkles size={12} />} title="AI Summary" badge={detail.ai_confidence ? `${Math.round(detail.ai_confidence)}%` : null}>
                      <p className="text-[12px] text-fg-secondary leading-relaxed">{detail.ai_summary}</p>
                    </Section>
                  )}

                  {/* OCR Text */}
                  {detail.ocr_text && (
                    <Section
                      icon={<FileText size={12} />}
                      title="Extracted Text"
                      badge={detail.ocr_confidence ? `${Math.round(detail.ocr_confidence)}%` : null}
                      action={
                        <button onClick={handleCopyOCR} className="text-[10px] text-fg-tertiary hover:text-fg-primary flex items-center gap-1 transition-colors">
                          {copied ? <Check size={10} className="text-success" /> : <Copy size={10} />}
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                      }
                    >
                      <pre className="text-[11px] font-mono text-fg-secondary bg-surface-sunken rounded-md p-2.5 whitespace-pre-wrap max-h-[150px] overflow-y-auto leading-relaxed">
                        {detail.ocr_text}
                      </pre>
                    </Section>
                  )}

                  {/* Tags */}
                  {detail.tags && detail.tags.length > 0 && (
                    <Section icon={<TagIcon size={12} />} title="Tags">
                      <div className="flex flex-wrap gap-1.5">
                        {detail.tags.map((t) => (
                          <Tag key={t.id} tone={t.tone || 'gray'} size="sm">
                            {t.label}
                          </Tag>
                        ))}
                      </div>
                    </Section>
                  )}
                </div>
              ) : null}

              {/* Actions footer */}
              <div className="p-3 border-t border-border flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Download size={12} />}
                  className="flex-1"
                  onClick={() => {
                    if (img?.storage_key) {
                      const a = document.createElement('a');
                      a.href = `/uploads/${img.storage_key}`;
                      a.download = img.filename;
                      a.click();
                    }
                  }}
                >
                  Download
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 size={12} />}
                  className="text-danger hover:bg-danger-soft/50"
                  onClick={handleDelete}
                  loading={deleting}
                >
                  Delete
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

const MetaItem = ({ label, value, badge }) => (
  <div className="bg-surface-muted/40 rounded-md p-2">
    <p className="text-[10px] text-fg-tertiary mb-0.5">{label}</p>
    <p className="text-[12px] font-medium text-fg-primary capitalize flex items-center gap-1.5">
      {badge && <span className={cn('w-1.5 h-1.5 rounded-full', badge === 'success' ? 'bg-success' : badge === 'danger' ? 'bg-danger' : 'bg-warning')} />}
      {value}
    </p>
  </div>
);

const Section = ({ icon, title, badge, action, children }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <h4 className="text-[11px] font-medium text-fg-tertiary tracking-wide flex items-center gap-1.5 uppercase">
        {icon}
        {title}
      </h4>
      <div className="flex items-center gap-2">
        {badge && <span className="text-[10px] font-medium text-accent-soft-fg bg-accent-soft px-1.5 py-0.5 rounded-xs">{badge}</span>}
        {action}
      </div>
    </div>
    {children}
  </div>
);

const formatBytes = (bytes) => {
  if (!bytes) return '—';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default ImageDetailModal;
