import React, { useState, useCallback } from 'react';
import { Upload as UploadIcon } from 'lucide-react';
import Button, { cn } from '../ui/Button';

const DropZone = ({ onFiles, accept = 'image/*', maxSize = 50 * 1024 * 1024 }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (onFiles) onFiles(files);
  }, [onFiles]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (onFiles) onFiles(files);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'w-full p-[36px_24px] rounded-lg border-[1.5px] dashed border-border-strong bg-surface transition-all duration-160 ease-out flex flex-col items-center justify-center text-center',
        isDragOver ? 'border-accent bg-accent-soft/30 scale-[1.01]' : 'hover:border-accent/50'
      )}
    >
      <div className="w-[40px] h-[40px] rounded-full bg-accent-soft flex items-center justify-center text-accent mb-4">
        <UploadIcon size={18} />
      </div>
      <h3 className="text-[15px] font-medium text-fg-primary mb-1">Drop images here</h3>
      <p className="text-[11px] text-fg-tertiary mb-6 max-w-[280px]">
        Or press ⌘V to paste · max 50 MB per file · JPEG, PNG, HEIC, WebP
      </p>
      
      <label>
        <input 
          type="file" 
          multiple 
          accept={accept} 
          className="hidden" 
          onChange={handleFileChange}
        />
        <Button variant="primary" size="md">Choose files</Button>
      </label>
    </div>
  );
};

export default DropZone;
