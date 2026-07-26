'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/scam-analyzer', label: 'Scam Analyzer' },
    { href: '/upi-guardian', label: 'UPI Guardian' },
    { href: '/learn', label: 'Learn' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/emergency', label: 'Emergency' },
  ];

  const isActive = (href) => pathname === href;

  return (
    <header className="glass-nav fixed top-0 w-full z-50 shadow-xl">
      <div className="flex justify-between items-center px-4 py-3 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-primary text-xl font-bold hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined icon-fill text-2xl">shield_locked</span>
          <span>SurakshaPayAI</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold transition-colors ${
                isActive(link.href)
                  ? 'text-primary border-b-2 border-primary pb-1'
                  : link.label === 'Emergency'
                    ? 'text-error hover:text-error/80'
                    : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">person</span>
              </Link>
              <button onClick={logout} className="bg-error/10 text-error px-4 py-2 rounded-xl text-sm font-semibold hover:bg-error/20 transition-colors">
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="bg-primary-container text-on-primary-container px-6 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-md">
              Login
            </Link>
          )}

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-on-surface-variant">
            <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-surface-container-lowest border-t border-outline-variant/10 animate-fade-in">
          <nav className="flex flex-col p-4 gap-1">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isActive(link.href) ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
