import React from 'react';
import { cn } from './Button';

const Skeleton = ({ width, height, shape = 'rect', className }) => {
  return (
    <div 
      className={cn(
        'shimmer bg-surface-muted',
        shape === 'rect' && 'rounded-md',
        shape === 'circle' && 'rounded-full',
        shape === 'text' && 'rounded-full h-[1em] my-[0.1em]',
        className
      )}
      style={{ width, height }}
    />
  );
};

export default Skeleton;
