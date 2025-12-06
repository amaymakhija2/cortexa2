import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const VALID_USERNAME = import.meta.env.VITE_AUTH_USERNAME || '';
const VALID_PASSWORD = import.meta.env.VITE_AUTH_PASSWORD || '';
const AUTH_SECRET = import.meta.env.VITE_AUTH_SECRET || '';
const AUTH_KEY = 'cortexa_auth';
const TOKEN_KEY = 'cortexa_token';
const BUILD_VERSION_KEY = 'cortexa_build';
const BUILD_VERSION = import.meta.env.VITE_BUILD_TIME || __BUILD_TIME__;

// Generate HMAC-SHA256 token for API authentication
async function generateToken(username: string): Promise<string> {
  const timestamp = Date.now().toString();
  const message = `${username}:${timestamp}`;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(AUTH_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(message)
  );

  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return btoa(`${message}:${signatureHex}`);
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const storedVersion = sessionStorage.getItem(BUILD_VERSION_KEY);
    if (storedVersion !== BUILD_VERSION) {
      // New build deployed - clear auth
      sessionStorage.removeItem(AUTH_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.setItem(BUILD_VERSION_KEY, BUILD_VERSION);
      return false;
    }
    return sessionStorage.getItem(AUTH_KEY) === 'true';
  });

  const [token, setToken] = useState<string | null>(() => {
    return sessionStorage.getItem(TOKEN_KEY);
  });

  const login = async (username: string, password: string): Promise<boolean> => {
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      // Generate API token
      const newToken = await generateToken(username);

      setIsAuthenticated(true);
      setToken(newToken);
      sessionStorage.setItem(AUTH_KEY, 'true');
      sessionStorage.setItem(TOKEN_KEY, newToken);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setToken(null);
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, logout }}>
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
