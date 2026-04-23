import React from 'react';
import { cn } from './Button';
import { X } from 'lucide-react';

const Chip = ({ active, onDismiss, count, tone = 'default', onClick, children, className }) => {
  const tones = {
    default: active 
      ? 'bg-accent-soft border-accent text-accent-soft-fg' 
      : 'bg-surface border-border text-fg-secondary hover:border-border-strong',
    accent: 'bg-accent-soft text-accent-soft-fg border-accent',
    success: 'bg-success-soft text-success-soft-fg border-success',
    warning: 'bg-warning-soft text-warning-soft-fg border-warning',
    danger: 'bg-danger-soft text-danger-soft-fg border-danger',
    info: 'bg-info-soft text-info-soft-fg border-info',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 h-[26px] px-[10px] rounded-full border-[0.5px] text-[12px] transition-all cursor-pointer select-none',
        tones[tone],
        className
      )}
    >
      <span>{children}</span>
      {count !== undefined && (
        <span className="opacity-50 font-mono text-[11px]">· {count}</span>
      )}
      {onDismiss && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="hover:bg-black/5 rounded-full p-0.5 transition-colors"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
};

export default Chip;
