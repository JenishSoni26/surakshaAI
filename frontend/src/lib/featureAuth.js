'use client';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

/**
 * Use this hook in feature pages to gate specific actions (not whole pages).
 * Visitors can browse the page, but using features requires login.
 *
 * Usage:
 *   const { requireAuth } = useFeatureAuth();
 *   const handleAnalyze = requireAuth(async () => { ... actual logic ... });
 */
export function useFeatureAuth() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  /**
   * Wraps a function so it only runs if the user is authenticated.
   * If not, redirects to /login with the current page as `from`.
   */
  const requireAuth = (fn) => {
    return async (...args) => {
      if (!isAuthenticated) {
        const from = typeof window !== 'undefined' ? window.location.pathname : '/';
        router.push(`/login?from=${encodeURIComponent(from)}`);
        return;
      }
      return fn(...args);
    };
  };

  return { requireAuth, isAuthenticated };
}
