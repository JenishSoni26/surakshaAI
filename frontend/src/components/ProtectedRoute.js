'use client';
import { useRequireAuth } from '@/lib/auth';

/**
 * Wraps any page that requires authentication.
 * - Server-side: middleware.js already redirects before the page loads.
 * - Client-side: this component handles the case where the token was
 *   cleared without a full page reload (e.g. manual localStorage clear).
 */
export default function ProtectedRoute({ children }) {
  const { loading, isAuthenticated } = useRequireAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg,#0a0f2e 0%,#0d1b4b 40%,#0a0f2e 100%)',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '16px',
          background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}>
          <span className="material-symbols-outlined icon-fill" style={{ color: 'white', fontSize: '26px' }}>shield</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: 0 }}>Verifying session…</p>
        <style>{`
          @keyframes pulse {
            0%,100%{transform:scale(1);opacity:1;}
            50%{transform:scale(1.08);opacity:0.85;}
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Will be redirected by useRequireAuth hook — render nothing
    return null;
  }

  return children;
}
