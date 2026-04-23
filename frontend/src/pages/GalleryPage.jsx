import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MasonryGrid from '../components/gallery/MasonryGrid';
import Chip from '../components/ui/Chip';
import Button from '../components/ui/Button';
import { Filter as FilterIcon, Plus } from 'lucide-react';

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
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => {
    fetchImages();
  }, [activeCategory]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/v1/images', {
        params: {
          category: activeCategory === 'all' ? undefined : activeCategory
        }
      });
      setImages(response.data.items);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-h1 font-medium text-fg-primary">Gallery</h1>
          <p className="text-small text-fg-tertiary mt-1">
            {images.length} images · last updated just now
          </p>
        </div>
        <div className="flex gap-2">
           <Button variant="ghost" size="md">Masonry</Button>
           <Button variant="ghost" size="md">Grid</Button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <FilterIcon size={14} className="text-fg-tertiary mr-1" />
        {CATEGORIES.map(cat => (
          <Chip 
            key={cat.id} 
            active={activeCategory === cat.id}
            onClick={() => setActiveCategory(cat.id)}
            count={activeCategory === cat.id ? images.length : undefined}
          >
            {cat.label}
          </Chip>
        ))}
        <Chip tone="default" onClick={() => {}}>+ Add filter</Chip>
      </div>

      {/* Masonry Grid */}
      <MasonryGrid 
        images={images} 
        loading={loading} 
        selectedIds={selectedIds}
        onSelect={handleSelect}
        onOpen={(id) => console.log("Open image", id)}
      />

      {/* Bulk Action Bar - Placeholder */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-surface border-[0.5px] border-border rounded-md shadow-e-3 p-2 flex items-center gap-3 z-50 animate-reveal">
           <span className="bg-accent-soft text-accent-soft-fg px-2 py-0.5 rounded-xs text-[11px] font-medium">{selectedIds.size} selected</span>
           <Button variant="ghost" size="sm">Tag</Button>
           <Button variant="ghost" size="sm">Move</Button>
           <Button variant="ghost" size="sm" className="text-danger">Delete</Button>
           <div className="w-[1px] h-4 bg-border mx-1" />
           <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>Clear</Button>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
