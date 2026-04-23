import React from 'react';
import { cn } from './Button';

const Tag = ({ tone = 'gray', size = 'sm', children, className }) => {
  const tones = {
    gray: 'bg-surface-muted text-fg-tertiary',
    accent: 'bg-accent-soft text-accent-soft-fg',
    success: 'bg-success-soft text-success-soft-fg',
    warning: 'bg-warning-soft text-warning-soft-fg',
    danger: 'bg-danger-soft text-danger-soft-fg',
    info: 'bg-info-soft text-info-soft-fg',
  };

  const sizes = {
    xs: 'text-[10px] px-[7px] py-[2px] rounded-xs',
    sm: 'text-[11px] px-[8px] py-[3px] rounded-sm',
  };

  return (
    <span className={cn(
      'inline-flex items-center font-medium',
      tones[tone],
      sizes[size],
      className
    )}>
      {children}
    </span>
  );
};

export default Tag;
