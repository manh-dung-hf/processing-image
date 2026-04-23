import React from 'react';
import { cn } from './Button';

const Input = React.forwardRef(({ label, leadingIcon, trailingIcon, error, hint, className, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-caption text-fg-tertiary mb-[5px] select-none">
          {label}
        </label>
      )}
      <div className="relative group">
        {leadingIcon && (
          <div className="absolute left-[12px] top-1/2 -translate-y-1/2 text-fg-tertiary transition-colors group-focus-within:text-fg-primary">
            {leadingIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full h-[38px] bg-surface border-[0.5px] border-border rounded-md text-[13px] text-fg-primary placeholder:text-fg-disabled transition-all',
            'focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2',
            leadingIcon ? 'pl-[34px]' : 'pl-[12px]',
            trailingIcon ? 'pr-[34px]' : 'pr-[12px]',
            error ? 'border-danger' : 'hover:border-border-strong',
            className
          )}
          {...props}
        />
        {trailingIcon && (
          <div className="absolute right-[12px] top-1/2 -translate-y-1/2 text-fg-tertiary">
            {trailingIcon}
          </div>
        )}
      </div>
      {(error || hint) && (
        <p className={cn(
          'mt-[6px] text-[11px]',
          error ? 'text-danger' : 'text-fg-tertiary'
        )}>
          {error || hint}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
