'use client';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-surface-container-lowest w-full border-t border-outline-variant/10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 py-12 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <div className="text-xl font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined icon-fill">shield</span>
            SurakshaAI
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {t('footer.desc')}
          </p>
          <p className="text-xs text-on-surface-variant/70 mt-1">
            {t('footer.copyright')}
          </p>
        </div>
        <div className="md:col-span-2 flex flex-wrap justify-end gap-6 items-start">
          <Link href="/scam-analyzer" className="text-xs font-medium text-on-surface-variant hover:text-primary transition-colors">
            {t('nav.scamAnalyzer')}
          </Link>
          <Link href="/upi-guardian" className="text-xs font-medium text-on-surface-variant hover:text-primary transition-colors">
            {t('nav.upiGuardian')}
          </Link>
          <Link href="/voice-detector" className="text-xs font-medium text-on-surface-variant hover:text-primary transition-colors">
            {t('nav.voiceDetect')}
          </Link>
          <Link href="/learn" className="text-xs font-medium text-on-surface-variant hover:text-primary transition-colors">
            {t('nav.learn')}
          </Link>
          <Link href="/emergency" className="text-xs font-medium text-on-surface-variant hover:text-primary transition-colors">
            {t('nav.emergency')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
