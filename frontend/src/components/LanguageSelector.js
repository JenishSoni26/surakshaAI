
'use client';
import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';

export default function LanguageSelector() {
  const { lang, changeLang, LANGUAGES } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Change language"
        aria-expanded={open}
        className="flex items-center gap-1.5 bg-surface-container hover:bg-surface-container-high px-3 py-2 rounded-xl text-xs font-semibold text-on-surface-variant transition-colors"
      >
        <span className="material-symbols-outlined text-base">translate</span>
        <span className="hidden sm:inline">{current.nativeLabel}</span>
        <span className="material-symbols-outlined text-sm transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>expand_more</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/15 py-2 z-50 animate-fade-in">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => { changeLang(l.code); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${l.code === lang
                  ? 'bg-primary-container/20 text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container'
                }`}
            >
              <span className="text-base font-medium w-8">{l.nativeLabel.charAt(0)}</span>
              <span className="flex-1">{l.nativeLabel}</span>
              {l.code === lang && <span className="material-symbols-outlined text-primary text-sm">check</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
