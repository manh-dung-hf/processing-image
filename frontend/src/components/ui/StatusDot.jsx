import React from 'react';
import { cn } from './Button';

const StatusDot = ({ status, size = 'sm', pulsing = false, className }) => {
  const colors = {
    analyzed: 'bg-success',
    processing: 'bg-warning',
    failed: 'bg-danger',
    queued: 'bg-fg-tertiary',
    live: 'bg-success',
  };

  const sizes = {
    xs: 'w-[5px] h-[5px]',
    sm: 'w-[6px] h-[6px]',
    md: 'w-[8px] h-[8px]',
  };

  return (
    <div className={cn(
      'rounded-full flex-shrink-0',
      colors[status],
      sizes[size],
      (pulsing || status === 'live' || status === 'processing') && 'animate-pulse',
      className
    )} />
  );
};

export default StatusDot;
