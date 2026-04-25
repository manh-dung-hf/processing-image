import React, { useState } from 'react';
import DropZone from '../components/upload/DropZone';
import Button from '../components/ui/Button';
import axios from 'axios';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../components/ui/Button';

const UploadPage = () => {
  const [uploads, setUploads] = useState([]);

  const handleFiles = async (files) => {
    const newUploads = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      filename: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading',
      file
    }));
    
    setUploads(prev => [...newUploads, ...prev]);

    // Process each upload
    for (const upload of newUploads) {
      await performUpload(upload);
    }
  };

  const performUpload = async (upload) => {
    const formData = new FormData();
    formData.append('file', upload.file);

    try {
      const response = await axios.post('/api/v1/images/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          updateUploadStatus(upload.id, { progress });
        }
      });
      
      updateUploadStatus(upload.id, { status: 'processing', progress: 100 });
      
      // Simulate processing wait or listen to WS
      setTimeout(() => {
        updateUploadStatus(upload.id, { status: 'analyzed' });
      }, 3000);

    } catch (error) {
      updateUploadStatus(upload.id, { status: 'failed', error: error.message });
    }
  };

  const updateUploadStatus = (id, updates) => {
    setUploads(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8 max-w-[800px] mx-auto">
      <div>
        <h1 className="text-h1 font-medium text-fg-primary">Upload</h1>
        <p className="text-small text-fg-tertiary mt-1">Add images to your workspace for analysis.</p>
      </div>

      <DropZone onFiles={handleFiles} />

      <div className="bg-info-soft/30 rounded-md p-3 flex items-center gap-3 text-info-soft-fg text-[12px]">
        <div className="bg-info-soft p-1 rounded-full"><Check size={12} /></div>
        <p>Or forward any image to <span className="font-medium">@lumen_bot</span> on Telegram →</p>
        <button className="ml-auto text-[11px] font-medium underline">Copy handle</button>
      </div>

      {uploads.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-caption text-fg-tertiary tracking-[0.04em]">RECENT UPLOADS</h4>
          <div className="bg-surface rounded-lg border-[0.5px] border-border overflow-hidden">
            {uploads.map((u, idx) => (
              <div 
                key={u.id} 
                className={cn(
                  "grid grid-cols-[40px_1fr_120px_80px] gap-3 p-[10px_14px] items-center",
                  idx !== uploads.length - 1 && "border-b-[0.5px] border-border",
                  u.status === 'analyzed' && "animate-pulse bg-accent-soft/10"
                )}
              >
                <div className="w-10 h-10 rounded-sm bg-surface-sunken flex items-center justify-center">
                   {u.status === 'uploading' ? <Loader2 size={16} className="animate-spin text-fg-tertiary" /> : <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${URL.createObjectURL(u.file)})` }} />}
                </div>
                <div>
                  <div className="text-[12px] font-medium text-fg-primary truncate max-w-[200px]">{u.filename}</div>
                  <div className="text-[11px] text-fg-tertiary">{formatSize(u.size)} · {u.status}</div>
                </div>
                <div className="h-1 bg-surface-muted rounded-full overflow-hidden">
                   <div className="h-full bg-accent transition-all duration-300" style={{ width: `${u.progress}%` }} />
                </div>
                <div className="text-right">
                  {u.status === 'analyzed' && <span className="text-[11px] font-medium text-success">Done</span>}
                  {u.status === 'processing' && <span className="text-[11px] font-medium text-warning">Processing</span>}
                  {u.status === 'failed' && <span className="text-[11px] font-medium text-danger flex items-center gap-1 justify-end"><AlertCircle size={10} /> Failed</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
