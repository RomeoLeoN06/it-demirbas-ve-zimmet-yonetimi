import React, { createContext, useContext, useState } from 'react';
import { mobileApi, setToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await mobileApi.login({ email, password });
      if (res.token) {
        setToken(res.token);
        setUser(res.user);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await mobileApi.register(userData);
      if (res.token) {
        setToken(res.token);
        setUser(res.user);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (googleData) => {
    setLoading(true);
    try {
      const res = await mobileApi.googleLogin(googleData);
      if (res.token) {
        setToken(res.token);
        setUser(res.user);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const refreshMe = async () => {
    try {
      const res = await mobileApi.getMe();
      if (res.user) {
        setUser(res.user);
      }
      return res;
    } catch (e) {
      console.warn('Failed to refresh user profile:', e);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        googleLogin,
        refreshMe,
        logout,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
