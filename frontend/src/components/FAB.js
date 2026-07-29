'use client';
import Link from 'next/link';

export default function FAB() {
  return (
    <Link href="/assistant" aria-label="Ask AI Assistant"
      className="fixed bottom-6 right-6 bg-primary text-on-primary w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group">
      <span className="material-symbols-outlined text-3xl icon-fill group-hover:rotate-12 transition-transform">smart_toy</span>
      <span className="absolute -top-2 -right-2 w-4 h-4 bg-error rounded-full border-2 border-background animate-pulse"></span>
      <div className="absolute right-16 bg-surface text-on-surface px-4 py-2 rounded-xl shadow-lg text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Ask AI Assistant
      </div>
    </Link>
  );
}
