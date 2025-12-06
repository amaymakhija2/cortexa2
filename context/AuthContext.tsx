import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const VALID_USERNAME = import.meta.env.VITE_AUTH_USERNAME || '';
const VALID_PASSWORD = import.meta.env.VITE_AUTH_PASSWORD || '';
const AUTH_KEY = 'cortexa_auth';
const BUILD_VERSION_KEY = 'cortexa_build';
const BUILD_VERSION = import.meta.env.VITE_BUILD_TIME || __BUILD_TIME__;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const storedVersion = sessionStorage.getItem(BUILD_VERSION_KEY);
    if (storedVersion !== BUILD_VERSION) {
      // New build deployed - clear auth
      sessionStorage.removeItem(AUTH_KEY);
      sessionStorage.setItem(BUILD_VERSION_KEY, BUILD_VERSION);
      return false;
    }
    return sessionStorage.getItem(AUTH_KEY) === 'true';
  });

  const login = (username: string, password: string): boolean => {
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem(AUTH_KEY, 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH_KEY);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
