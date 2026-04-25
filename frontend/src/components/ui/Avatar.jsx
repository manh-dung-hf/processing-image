import React from 'react';
import { cn } from './Button';

const Avatar = ({ src, alt, name, size = 'md', className }) => {
  const sizes = {
    xs: 'w-[20px] h-[20px] text-[9px]',
    sm: 'w-[24px] h-[24px] text-[10px]',
    md: 'w-[28px] h-[28px] text-[11px]',
    lg: 'w-[36px] h-[36px] text-[13px]',
  };

  const initials = name
    ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div
      className={cn(
        'rounded-full bg-accent-soft flex items-center justify-center font-medium text-accent-soft-fg overflow-hidden flex-shrink-0',
        sizes[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={alt || name || 'avatar'} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

export default Avatar;
