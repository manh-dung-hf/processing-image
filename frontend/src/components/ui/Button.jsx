import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'soft' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'ghost', size = 'md', icon, trailingIcon, loading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-fg-primary text-surface font-medium hover:bg-accent active:scale-[0.98]',
      ghost: 'bg-transparent text-fg-primary border-[0.5px] border-border hover:bg-surface-muted active:scale-[0.98]',
      soft: 'bg-accent-soft text-accent-soft-fg border-none hover:brightness-95',
      danger: 'bg-danger text-white hover:brightness-90',
    };

    const sizes = {
      sm: 'h-[28px] px-[10px] text-[12px]',
      md: 'h-[32px] px-[12px] text-[13px]',
      lg: 'h-[40px] px-[16px] text-[14px]',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          icon && <span className="flex-shrink-0">{icon}</span>
        )}
        {children}
        {!loading && trailingIcon && <span className="flex-shrink-0">{trailingIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
