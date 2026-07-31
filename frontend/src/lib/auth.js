'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

// Cookie helpers
function setCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('suraksha_token');
      const savedUser = localStorage.getItem('suraksha_user');
      queueMicrotask(() => {
        if (savedToken) {
          setToken(savedToken);
        }
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch {}
        }
        setMounted(true);
      });
    }
  }, []);

  useEffect(() => {
    if (token) {
      setCookie('suraksha_token', token);
    }
  }, [token]);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('suraksha_token', authToken);
      localStorage.setItem('suraksha_user', JSON.stringify(userData));
    }
    setCookie('suraksha_token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('suraksha_token');
      localStorage.removeItem('suraksha_user');
    }
    deleteCookie('suraksha_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading: !mounted, login, logout, isAuthenticated: !!token && mounted, mounted }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export function useRequireAuth() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  return { loading, isAuthenticated };
}
