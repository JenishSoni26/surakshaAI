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
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('suraksha_token');
    const savedUser = localStorage.getItem('suraksha_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      try { setUser(JSON.parse(savedUser)); } catch {}
      // Ensure cookie is in sync (in case it was cleared)
      setCookie('suraksha_token', savedToken);
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('suraksha_token', authToken);
    localStorage.setItem('suraksha_user', JSON.stringify(userData));
    // Set cookie so middleware can read it server-side
    setCookie('suraksha_token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('suraksha_token');
    localStorage.removeItem('suraksha_user');
    // Clear cookie
    deleteCookie('suraksha_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

// Client-side route guard — use this in any page that needs protection
// as a fallback in case the cookie is stale or missing
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
