import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../ui/Button';

const NavItem = ({ to, label, icon, badge, active }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        'group flex items-center gap-[10px] h-[32px] px-[10px] rounded-md text-[13px] transition-all hover:bg-surface-muted hover:text-fg-primary',
        isActive ? 'bg-surface-muted text-fg-primary font-medium' : 'text-fg-secondary'
      )}
    >
      {({ isActive }) => (
        <>
          <div className={cn(
            'w-[6px] h-[6px] rounded-full transition-colors',
            isActive ? 'bg-accent' : 'bg-fg-tertiary group-hover:bg-fg-secondary'
          )} />
          {icon && <span className="w-4 h-4 flex items-center justify-center opacity-70 group-hover:opacity-100">{icon}</span>}
          <span className="flex-1">{label}</span>
          {badge && (
            <span className={cn(
              'px-[6px] py-[1px] rounded-full font-mono text-[10px]',
              (badge === '!' || badge === 'New') 
                ? 'bg-accent-soft text-accent-soft-fg' 
                : 'bg-surface-muted text-fg-secondary'
            )}>
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
};

export default NavItem;
