import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AppShell = () => {
  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Sidebar - Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-[var(--sidebar-width)] min-h-screen">
        <Topbar />
        <main className="flex-1 p-[var(--canvas-padding)] max-w-[var(--content-max-width)] mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell;
