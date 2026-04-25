import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppShell from './components/layout/AppShell';
import GalleryPage from './pages/GalleryPage';
import UploadPage from './pages/UploadPage';
import TimelinePage from './pages/TimelinePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SettingsPage from './pages/SettingsPage';
import TelegramConfigPage from './pages/TelegramConfigPage';

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
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/gallery" replace />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/search" element={<Placeholder title="Search" />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/analytics" element={<Placeholder title="Analytics" />} />
            <Route path="/ops" element={<Placeholder title="Operations" />} />
            <Route path="/telegram" element={<TelegramConfigPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
