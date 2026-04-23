import React from 'react';
import { Panel } from './AISummaryPanel';
import { Copy } from 'lucide-react';

const OCRPanel = ({ text, engine = 'Tesseract', confidence = 96.2 }) => {
  return (
    <Panel 
      eyebrow="EXTRACTED TEXT · OCR"
      eyebrowRight={
        <span className="text-mono text-[11px] text-fg-tertiary">{engine} · {confidence}%</span>
      }
    >
      {text ? (
        <div className="relative group/ocr">
          <pre className="bg-surface-sunken rounded-md p-[10px_12px] font-mono text-[12px] leading-[18px] text-fg-secondary whitespace-pre-wrap overflow-y-auto max-h-[300px]">
            {text}
          </pre>
          <button className="absolute top-2 right-2 p-1.5 rounded-md bg-surface border-[0.5px] border-border text-fg-tertiary hover:text-fg-primary opacity-0 group-hover/ocr:opacity-100 transition-opacity">
            <Copy size={12} />
          </button>
        </div>
      ) : (
        <p className="text-[13px] text-fg-tertiary italic">No text detected in this image</p>
      )}
    </Panel>
  );
};

export default OCRPanel;
