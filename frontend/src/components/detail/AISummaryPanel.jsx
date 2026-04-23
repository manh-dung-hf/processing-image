import React from 'react';
import { cn } from '../ui/Button';

export const Panel = ({ eyebrow, eyebrowRight, children, className }) => {
  return (
    <div className={cn('bg-surface rounded-lg border-[0.5px] border-border p-[14px_16px]', className)}>
      <div className="flex items-center justify-between mb-[10px]">
        <span className="text-caption text-fg-tertiary tracking-[0.04em] uppercase">{eyebrow}</span>
        {eyebrowRight && <div>{eyebrowRight}</div>}
      </div>
      <div className="text-body text-fg-primary">
        {children}
      </div>
    </div>
  );
};

export const AISummaryPanel = ({ summary, confidence }) => {
  const confidenceColor = confidence >= 85 ? 'success' : confidence >= 70 ? 'warning' : 'danger';
  
  return (
    <Panel 
      eyebrow="AI SUMMARY" 
      eyebrowRight={
        <div className={cn(
          'text-[10px] font-medium px-[6px] py-[1px] rounded-xs',
          `bg-${confidenceColor}-soft text-${confidenceColor}-soft-fg`
        )}>
          {confidence}% confidence
        </div>
      }
    >
      <p className="leading-relaxed text-[13px]">{summary}</p>
    </Panel>
  );
};
