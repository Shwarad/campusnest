import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import api from '../services/api';

interface AuthContextType {
  user:            User | null;
  token:           string | null;
  isLoading:       boolean;
  isAuthenticated: boolean;
  login:           (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string, role?: 'student' | 'owner', college?: string) => Promise<void>;
  loginWithPhone:  (phone: string, otp: string) => Promise<void>;
  loginWithEmailOtp:(email: string, otp: string) => Promise<void>;
  register:        (data: RegisterData) => Promise<void>;
  logout:          () => void;
  updateUser:      (user: User) => void;
  refreshUser:     () => Promise<void>;
}

interface RegisterData {
  name:     string;
  email:    string;
  phone:    string;
  password: string;
  role:     'student' | 'owner';
  college?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user,      setUser]      = useState<User | null>(null);
  const [token,     setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const storeAuth = (newToken: string, newUser: User) => {
    localStorage.setItem('campusnest_token', newToken);
    localStorage.setItem('campusnest_user',  JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const clearAuth = () => {
    localStorage.removeItem('campusnest_token');
    localStorage.removeItem('campusnest_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      localStorage.setItem('campusnest_user', JSON.stringify(res.data.user));
    } catch {
      clearAuth();
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('campusnest_token');
    const storedUser  = localStorage.getItem('campusnest_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try { setUser(JSON.parse(storedUser)); } catch { clearAuth(); }
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [refreshUser]);

  // ── Auth methods ────────────────────────────────────────────────────────────

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    storeAuth(res.data.token, res.data.user);
  };

  const loginWithGoogle = async (idToken: string, role: 'student' | 'owner' = 'student', college?: string) => {
    const res = await api.post('/auth/google', { idToken, role, college });
    storeAuth(res.data.token, res.data.user);
  };

  const loginWithPhone = async (phone: string, otp: string) => {
    const res = await api.post('/auth/phone/verify-otp', { phone, otp });
    storeAuth(res.data.token, res.data.user);
  };

  const loginWithEmailOtp = async (email: string, otp: string) => {
    const res = await api.post('/auth/email/verify-otp', { email, otp });
    storeAuth(res.data.token, res.data.user);
  };

  const register = async (data: RegisterData) => {
    const res = await api.post('/auth/register', data);
    storeAuth(res.data.token, res.data.user);
  };

  const logout = () => clearAuth();

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('campusnest_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user, token, isLoading, isAuthenticated: !!user,
      login, loginWithGoogle, loginWithPhone, loginWithEmailOtp,
      register, logout, updateUser, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
