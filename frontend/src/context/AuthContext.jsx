import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = 'http://localhost:8000/api/v1/auth';

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

  // Axios instance with auth header
  const api = useCallback(() => {
    const t = localStorage.getItem('token');
    return axios.create({
      baseURL: API,
      headers: t ? { Authorization: `Bearer ${t}` } : {},
    });
  }, []);

  // Fetch current user on mount / token change
  useEffect(() => {
    const fetchUser = async () => {
      const stored = localStorage.getItem('token');
      if (!stored) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API}/me`, {
          headers: { Authorization: `Bearer ${stored}` },
        });
        setUser(res.data);
      } catch {
        // Token expired or invalid
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post(`${API}/login`, { email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (email, password, name) => {
    await axios.post(`${API}/register`, { email, password, name });
    // Auto-login after register
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
