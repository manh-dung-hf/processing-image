import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { API_BASE } from '../lib/api';

const AUTH_API = `${API_BASE}/auth`;

// Fallback user when backend is unavailable — allows browsing the app
const FALLBACK_USER = {
  id: 'default-user',
  email: 'minh@lumen.local',
  name: 'Minh T.',
  role: 'admin',
  avatar_url: null,
  created_at: new Date().toISOString(),
};

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const initRef = useRef(false);

  // Axios instance with current auth header
  const api = useCallback(() => {
    const t = localStorage.getItem('token');
    return axios.create({
      baseURL: AUTH_API,
      headers: t ? { Authorization: `Bearer ${t}` } : {},
    });
  }, []);

  // Bootstrap auth — runs ONCE on mount
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const bootstrap = async () => {
      const stored = localStorage.getItem('token');

      // 1. Try existing token
      if (stored) {
        try {
          const res = await axios.get(`${AUTH_API}/me`, {
            headers: { Authorization: `Bearer ${stored}` },
          });
          setUser(res.data);
          setLoading(false);
          return;
        } catch {
          localStorage.removeItem('token');
        }
      }

      // 2. Auto-login with default admin (dev convenience)
      try {
        const res = await axios.post(`${AUTH_API}/login`, {
          email: 'admin@lumen.local',
          password: 'admin1234',
        });
        const { access_token, user: userData } = res.data;
        localStorage.setItem('token', access_token);
        setToken(access_token);
        setUser(userData);
      } catch {
        // 3. Backend unreachable — fallback user
        setUser(FALLBACK_USER);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${AUTH_API}/login`, { email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (email, password, name) => {
    await axios.post(`${AUTH_API}/register`, { email, password, name });
    return login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await api().patch('/me', data);
    setUser(res.data);
    return res.data;
  };

  const changePassword = async (currentPassword, newPassword) => {
    await api().post('/me/password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        api,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
