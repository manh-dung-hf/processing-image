import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  Clock,
  Search,
  Upload as UploadIcon,
  BarChart3,
  Activity,
  Settings,
  ChevronUp,
  LogOut,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavItem from './NavItem';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = (user?.name || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-[var(--sidebar-width)] h-screen flex flex-col bg-surface border-r-[0.5px] border-border py-[18px] px-[14px] fixed left-0 top-0 z-20">
      {/* Brand */}
      <div className="flex items-center gap-[10px] px-[8px] pb-[18px] mb-[12px] border-b-[0.5px] border-border">
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
        <h4 className="px-[10px] pb-[6px] text-[11px] font-medium text-fg-tertiary tracking-[0.04em]">
          INTELLIGENCE
        </h4>
        <nav className="flex flex-col gap-[4px]">
          <NavItem to="/analytics" label="Analytics" icon={<BarChart3 size={14} />} />
        </nav>
      </div>

      {/* Workspace */}
      <div className="mt-[14px]">
        <h4 className="px-[10px] pb-[6px] text-[11px] font-medium text-fg-tertiary tracking-[0.04em]">
          WORKSPACE
        </h4>
        <nav className="flex flex-col gap-[4px]">
          <NavItem to="/ops" label="Operations" icon={<Activity size={14} />} badge="!" />
          <NavItem to="/settings" label="Settings" icon={<Settings size={14} />} />
        </nav>
      </div>

      {/* User Chip */}
      <div className="mt-auto pt-[12px] border-t-[0.5px] border-border relative" ref={menuRef}>
        {/* Popup menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 right-0 mb-2 bg-surface border-[0.5px] border-border rounded-lg shadow-e-3 overflow-hidden z-30"
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] text-fg-secondary hover:bg-surface-muted transition-colors"
              >
                <User size={13} />
                Profile & Settings
              </button>
              <div className="h-[0.5px] bg-border" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] text-danger hover:bg-danger-soft/30 transition-colors"
              >
                <LogOut size={13} />
                Sign out
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-[10px] p-[8px] rounded-md hover:bg-surface-muted cursor-pointer transition-colors"
        >
          <div className="w-[28px] h-[28px] rounded-full bg-accent-soft flex items-center justify-center text-[11px] font-medium text-accent-soft-fg">
            {initials}
          </div>
          <div className="flex-1 flex flex-col min-w-0">
            <span className="text-[13px] font-medium text-fg-primary truncate">
              {user?.name || 'User'}
            </span>
            <span className="text-[11px] text-fg-tertiary truncate">
              {user?.role === 'admin' ? 'Admin' : 'Member'}
            </span>
          </div>
          <motion.div animate={{ rotate: menuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronUp size={14} className="text-fg-tertiary" />
          </motion.div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
