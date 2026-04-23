import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import GalleryPage from './pages/GalleryPage';
import UploadPage from './pages/UploadPage';

// Placeholder pages
const Placeholder = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-fg-tertiary">
    <h2 className="text-h2 font-medium">{title}</h2>
    <p className="text-small">This page is under construction.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/gallery" replace />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/timeline" element={<Placeholder title="Timeline" />} />
          <Route path="/search" element={<Placeholder title="Search" />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/analytics" element={<Placeholder title="Analytics" />} />
          <Route path="/ops" element={<Placeholder title="Operations" />} />
          <Route path="/settings" element={<Placeholder title="Settings" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
