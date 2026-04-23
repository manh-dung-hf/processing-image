import React from 'react';
import { Search, Plus, Bell } from 'lucide-react';
import Button from '../ui/Button';

const Topbar = () => {
  return (
    <header className="h-[var(--topbar-height)] bg-surface border-b-[0.5px] border-border px-[20px] flex items-center gap-[12px] sticky top-0 z-10">
      {/* Breadcrumb / Title placeholder */}
      <div className="text-[13px] font-medium text-fg-primary hidden md:block">
        Gallery
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-[420px] relative md:ml-[12px]">
        <Search className="absolute left-[11px] top-1/2 -translate-y-1/2 text-fg-tertiary" size={14} />
        <input 
          type="text" 
          placeholder="Search or ask anything..."
          className="w-full h-[34px] bg-surface-muted rounded-md border-[0.5px] border-border pl-[34px] pr-[45px] text-[13px] focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 transition-all"
        />
        <div className="absolute right-[10px] top-1/2 -translate-y-1/2 flex gap-1">
          <kbd className="h-[18px] px-1.5 rounded-xs border-[0.5px] border-border bg-surface text-[11px] font-mono text-fg-tertiary flex items-center">⌘K</kbd>
        </div>
      </div>

      {/* Right Cluster */}
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="sm" icon={<Plus size={16} />} className="w-[32px] h-[32px] p-0" />
        <div className="relative">
          <Button variant="ghost" size="sm" icon={<Bell size={16} />} className="w-[32px] h-[32px] p-0" />
          <div className="absolute top-[6px] right-[6px] w-[6px] h-[6px] bg-danger rounded-full border border-surface" />
        </div>
        <div className="w-[28px] h-[28px] rounded-full bg-accent-soft border-[0.5px] border-border overflow-hidden cursor-pointer">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
