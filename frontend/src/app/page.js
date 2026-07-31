'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';

const FEATURE_COLOR_CLASSES = {
  primary: 'bg-primary-container/20 text-primary',
  secondary: 'bg-secondary-container/20 text-secondary',
  tertiary: 'bg-tertiary-container/20 text-tertiary',
  error: 'bg-error-container/20 text-error',
};

export default function HomePage() {
  const { t } = useLanguage();

  const features = [
    { icon: 'psychology', title: t('home.f1.title'), desc: t('home.f1.desc'), color: 'primary' },
    { icon: 'account_balance_wallet', title: t('home.f2.title'), desc: t('home.f2.desc'), color: 'secondary' },
    { icon: 'qr_code_scanner', title: t('qr.title'), desc: t('qr.subtitle'), color: 'tertiary' },
    { icon: 'record_voice_over', title: t('home.f3.title'), desc: t('home.f3.desc'), color: 'primary' },
    { icon: 'school', title: t('nav.learn'), desc: t('learn.subtitle'), color: 'secondary' },
    { icon: 'emergency', title: t('home.f4.title'), desc: t('home.f4.desc'), color: 'error' },
  ];

  const stats = [
    { value: '10,000+', label: t('home.stats.scans') },
    { value: '98.3%', label: t('home.stats.accuracy') },
    { value: '72ms', label: t('home.stats.latency') },
    { value: '24/7', label: t('home.stats.protection') },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-32 pb-12">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 mb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-6">
                <span className="material-symbols-outlined text-sm icon-fill">shield</span>
                {t('home.hero.badge')}
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-on-background mb-6 leading-tight tracking-tight">
                {t('home.hero.title')}
              </h1>
              <p className="text-base md:text-lg text-on-surface-variant mb-8 max-w-lg leading-relaxed">
                {t('home.hero.subtitle')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/scam-analyzer" className="bg-primary text-on-primary px-8 py-3.5 rounded-xl text-sm font-bold shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl">security_update_warning</span>
                  {t('home.hero.getStarted')}
                </Link>
                <Link href="/learn" className="bg-surface border border-primary/30 text-primary px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-primary-fixed/20 transition-all duration-300">
                  {t('home.hero.tryDemo')}
                </Link>
              </div>
            </div>
            <div className="relative animate-fade-in-up delay-100 hidden md:block">
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl scale-150" />
              <div className="relative z-10 w-full max-w-md mx-auto">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-8 border border-primary/10 shadow-2xl">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-glow">
                      <span className="material-symbols-outlined text-5xl text-primary icon-fill">shield_locked</span>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-primary mb-1">SurakshaAI Shield Active</div>
                      <div className="text-xs text-on-surface-variant">Real-time Multi-Language Protection</div>
                    </div>
                    <div className="w-full bg-surface-container rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-success text-sm">check_circle</span><span className="text-xs text-on-surface-variant font-medium">SMS Phishing Engine Active</span></div>
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-success text-sm">check_circle</span><span className="text-xs text-on-surface-variant font-medium">UPI VPA Verification Active</span></div>
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-success text-sm">check_circle</span><span className="text-xs text-on-surface-variant font-medium">QR Safety Analyzer Ready</span></div>
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-success text-sm">check_circle</span><span className="text-xs text-on-surface-variant font-medium">Voice Deepfake Detector Ready</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-surface-container-low py-12 mb-32 border-y border-outline-variant/10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="bg-surface p-6 rounded-2xl shadow-xl hover:-translate-y-1 transition-transform border border-outline-variant/10 text-center">
                  <div className="text-primary text-2xl md:text-3xl font-black mb-1">{stat.value}</div>
                  <div className="text-on-surface-variant text-xs font-semibold">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Voice Scam Detection CTA Section */}
        <section className="max-w-7xl mx-auto px-4 mb-32">
          <Link href="/voice-detector" className="block group">
            <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-surface to-tertiary-container/20 rounded-3xl border border-primary/15 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-12 items-center">
                <div className="animate-fade-in-up">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-primary icon-fill">record_voice_over</span>
                    </div>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">AI Voice Feature</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-on-background mb-3">
                    {t('voice.title')}
                  </h2>
                  <p className="text-on-surface-variant mb-6 leading-relaxed text-sm">
                    {t('voice.subtitle')}
                  </p>
                  <div className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-3.5 rounded-xl text-sm font-bold shadow-lg group-hover:scale-[1.02] transition-all">
                    <span className="material-symbols-outlined text-xl">mic</span>
                    {t('voice.analyzeBtn')}
                    <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center animate-fade-in-up delay-200">
                  <div className="relative w-full max-w-xs">
                    <div className="bg-surface-container-lowest/90 backdrop-blur-sm rounded-3xl p-6 border border-outline-variant/10 shadow-lg text-center">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-error animate-pulse" />
                        <span className="text-xs font-semibold text-on-surface-variant">Web Audio DSP Engine Active</span>
                      </div>
                      <div className="flex items-end justify-center gap-1.5 h-20 mb-6">
                        {[35, 55, 25, 70, 45, 85, 30, 60, 40, 75, 20, 50, 65, 35, 80].map((h, i) => (
                          <div key={i} className="w-1.5 rounded-full bg-primary" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                      <div className="flex items-center justify-center gap-2 bg-success/10 rounded-xl px-3 py-2">
                        <span className="material-symbols-outlined text-success text-base">check_circle</span>
                        <span className="text-xs font-bold text-success">Verified Signal Integrity</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 mb-32">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl font-extrabold text-on-background mb-4">{t('home.features.title')}</h2>
            <p className="text-base text-on-surface-variant max-w-2xl mx-auto">{t('home.features.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-surface p-8 rounded-3xl border border-outline-variant/10 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 animate-fade-in-up">
                <div className={`${FEATURE_COLOR_CLASSES[f.color] || 'bg-primary-container/20 text-primary'} w-14 h-14 rounded-2xl flex items-center justify-center mb-6`}>
                  <span className="material-symbols-outlined text-3xl">{f.icon}</span>
                </div>
                <h3 className="text-lg font-bold mb-2 text-on-surface">{f.title}</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <FAB />
    </div>
  );
}
