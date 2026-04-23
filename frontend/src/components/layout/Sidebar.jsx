import React from 'react';
import { 
  LayoutGrid, 
  Clock, 
  Search, 
  Upload as UploadIcon, 
  BarChart3, 
  Activity, 
  Settings, 
  ChevronUp 
} from 'lucide-react';
import NavItem from './NavItem';
import Avatar from '../ui/Avatar';

const Sidebar = () => {
  return (
    <aside className="w-[var(--sidebar-width)] h-screen flex flex-col bg-surface border-r-[0.5px] border-border py-[18px] px-[14px] fixed left-0 top-0 z-20">
      {/* Brand */}
      <div className="flex items-center gap-[10px] px-[8px] pb-[18px] mb-[12px] border-bottom-[0.5px] border-border">
        <div className="w-[22px] h-[22px] bg-accent rounded-sm flex items-center justify-center">
           <div className="w-[12px] h-[12px] border-2 border-white rounded-full rotate-45" />
        </div>
        <span className="text-[15px] font-medium tracking-tight">Lumen</span>
      </div>

      {/* Primary Nav */}
      <nav className="flex flex-col gap-[4px]">
        <NavItem to="/gallery" label="Gallery" icon={<LayoutGrid size={14} />} />
        <NavItem to="/timeline" label="Timeline" icon={<Clock size={14} />} />
        <NavItem to="/search" label="Search" icon={<Search size={14} />} />
        <NavItem to="/upload" label="Upload" icon={<UploadIcon size={14} />} />
      </nav>

      {/* Intelligence */}
      <div className="mt-[14px]">
        <h4 className="px-[10px] pb-[6px] text-[11px] font-medium text-fg-tertiary tracking-[0.04em]">INTELLIGENCE</h4>
        <nav className="flex flex-col gap-[4px]">
          <NavItem to="/analytics" label="Analytics" icon={<BarChart3 size={14} />} />
        </nav>
      </div>

      {/* Workspace */}
      <div className="mt-[14px]">
        <h4 className="px-[10px] pb-[6px] text-[11px] font-medium text-fg-tertiary tracking-[0.04em]">WORKSPACE</h4>
        <nav className="flex flex-col gap-[4px]">
          <NavItem to="/ops" label="Operations" icon={<Activity size={14} />} badge="!" />
          <NavItem to="/settings" label="Settings" icon={<Settings size={14} />} />
        </nav>
      </div>

      {/* User Chip */}
      <div className="mt-auto pt-[12px] border-t-[0.5px] border-border">
        <div className="flex items-center gap-[10px] p-[8px] rounded-md hover:bg-surface-muted cursor-pointer transition-colors">
          <div className="w-[28px] h-[28px] rounded-full bg-accent-soft flex items-center justify-center text-[11px] font-medium text-accent-soft-fg">
            MT
          </div>
          <div className="flex-1 flex flex-col min-width-0">
            <span className="text-[13px] font-medium text-fg-primary truncate">Minh T.</span>
            <span className="text-[11px] text-fg-tertiary truncate">Lumen Workspace</span>
          </div>
          <ChevronUp size={14} className="text-fg-tertiary" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
