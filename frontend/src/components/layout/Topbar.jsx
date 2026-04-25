import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Bell, User, Settings, LogOut, X,
  Image as ImageIcon, Clock, CheckCircle2, AlertCircle,
} from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

const PAGE_TITLES = {
  '/gallery': 'Gallery',
  '/timeline': 'Timeline',
  '/search': 'Search',
  '/upload': 'Upload',
  '/analytics': 'Analytics',
  '/ops': 'Operations',
  '/telegram': 'Telegram',
  '/settings': 'Settings',
};

const Topbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifsRef = useRef(null);
  const userRef = useRef(null);

  const pageTitle = PAGE_TITLES[location.pathname] || 'Lumen';

  const initials = (user?.name || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target)) setShowNotifs(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchFocus = () => {
    navigate('/search');
  };

  return (
    <header className="h-[var(--topbar-height)] bg-surface border-b-[0.5px] border-border px-[20px] flex items-center gap-[12px] sticky top-0 z-10">
      {/* Breadcrumb */}
      <div className="text-[13px] font-medium text-fg-primary hidden md:block">
        {pageTitle}
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-[420px] relative md:ml-[12px]">
        <Search className="absolute left-[11px] top-1/2 -translate-y-1/2 text-fg-tertiary" size={14} />
        <input
          type="text"
          placeholder="Search or ask anything..."
          onFocus={handleSearchFocus}
          readOnly
          className="w-full h-[34px] bg-surface-muted rounded-md border-[0.5px] border-border pl-[34px] pr-[45px] text-[13px] cursor-pointer focus:outline-none hover:border-border-strong transition-all"
        />
        <div className="absolute right-[10px] top-1/2 -translate-y-1/2 flex gap-1">
          <kbd className="h-[18px] px-1.5 rounded-xs border-[0.5px] border-border bg-surface text-[11px] font-mono text-fg-tertiary flex items-center">⌘K</kbd>
        </div>
      </div>

      {/* Right Cluster */}
      <div className="ml-auto flex items-center gap-2">
        {/* + Upload */}
        <Button
          variant="ghost"
          size="sm"
          icon={<Plus size={16} />}
          className="w-[32px] h-[32px] p-0"
          onClick={() => navigate('/upload')}
          title="Upload images"
        />

        {/* Notifications */}
        <div className="relative" ref={notifsRef}>
          <Button
            variant="ghost"
            size="sm"
            icon={<Bell size={16} />}
            className="w-[32px] h-[32px] p-0"
            onClick={() => { setShowNotifs(!showNotifs); setShowUserMenu(false); }}
          />
          <div className="absolute top-[6px] right-[6px] w-[6px] h-[6px] bg-danger rounded-full border border-surface" />

          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-[320px] bg-surface border border-border rounded-xl shadow-e-3 overflow-hidden z-30"
              >
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <h4 className="text-[13px] font-medium text-fg-primary">Notifications</h4>
                  <button onClick={() => setShowNotifs(false)} className="text-fg-tertiary hover:text-fg-primary transition-colors">
                    <X size={14} />
                  </button>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  <NotifItem
                    icon={<CheckCircle2 size={14} className="text-success" />}
                    title="AI analysis complete"
                    desc="3 images have been analyzed"
                    time="2m ago"
                  />
                  <NotifItem
                    icon={<ImageIcon size={14} className="text-accent" />}
                    title="New upload"
                    desc="Image uploaded via web"
                    time="5m ago"
                  />
                  <NotifItem
                    icon={<Clock size={14} className="text-warning" />}
                    title="Processing queue"
                    desc="2 images in queue"
                    time="10m ago"
                  />
                </div>
                <div className="px-4 py-2.5 border-t border-border">
                  <button
                    onClick={() => { setShowNotifs(false); navigate('/ops'); }}
                    className="text-[11px] text-accent font-medium hover:underline"
                  >
                    View all activity →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User avatar */}
        <div className="relative" ref={userRef}>
          <div
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifs(false); }}
            className="w-[28px] h-[28px] rounded-full bg-accent-soft border-[0.5px] border-border flex items-center justify-center text-[10px] font-medium text-accent-soft-fg cursor-pointer hover:border-border-strong transition-colors"
          >
            {initials}
          </div>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-[200px] bg-surface border border-border rounded-xl shadow-e-3 overflow-hidden z-30"
              >
                {/* User info */}
                <div className="px-3.5 py-3 border-b border-border">
                  <p className="text-[12px] font-medium text-fg-primary truncate">{user?.name}</p>
                  <p className="text-[11px] text-fg-tertiary truncate">{user?.email}</p>
                </div>

                <div className="py-1">
                  <MenuBtn icon={<User size={13} />} label="Profile" onClick={() => { setShowUserMenu(false); navigate('/settings'); }} />
                  <MenuBtn icon={<Settings size={13} />} label="Settings" onClick={() => { setShowUserMenu(false); navigate('/settings'); }} />
                </div>

                <div className="border-t border-border py-1">
                  <MenuBtn
                    icon={<LogOut size={13} />}
                    label="Sign out"
                    danger
                    onClick={() => { logout(); navigate('/login'); }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

const NotifItem = ({ icon, title, desc, time }) => (
  <div className="px-4 py-3 flex gap-3 hover:bg-surface-muted/50 transition-colors cursor-pointer">
    <div className="mt-0.5 flex-shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-[12px] font-medium text-fg-primary">{title}</p>
      <p className="text-[11px] text-fg-tertiary truncate">{desc}</p>
    </div>
    <span className="text-[10px] text-fg-tertiary flex-shrink-0">{time}</span>
  </div>
);

const MenuBtn = ({ icon, label, danger, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] transition-colors ${
      danger
        ? 'text-danger hover:bg-danger-soft/30'
        : 'text-fg-secondary hover:bg-surface-muted'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default Topbar;
