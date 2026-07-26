'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';
import Link from 'next/link';

const features = [
  { icon: 'psychology', title: 'AI Scam Detection', desc: 'Analyze suspicious SMS, emails, and messages using real-time machine learning models.', color: 'primary' },
  { icon: 'account_balance_wallet', title: 'UPI Guardian', desc: 'Real-time monitoring of UPI requests and transaction verification for complete peace of mind.', color: 'secondary' },
  { icon: 'qr_code_scanner', title: 'QR Code Scanner', desc: 'Scan QR codes before interacting to identify malicious links or unauthorized payment destinations.', color: 'tertiary' },
  { icon: 'record_voice_over', title: 'Voice Scam Detection', desc: 'Detect deepfake voices and suspicious call patterns using advanced audio analysis technology.', color: 'primary' },
  { icon: 'school', title: 'Financial Literacy', desc: 'Interactive guides and simulations to help you recognize and avoid the latest financial scams.', color: 'secondary' },
  { icon: 'emergency', title: 'Emergency Support', desc: 'One-tap access to freeze accounts and report fraud to official authorities instantly.', color: 'error' },
];

const steps = [
  { num: '1', title: 'Upload Message', desc: 'Copy and paste any suspicious message or upload a screenshot.' },
  { num: '2', title: 'AI Analysis', desc: 'Our neural networks scan for patterns, malicious links, and fraud markers.' },
  { num: '3', title: 'Risk Score', desc: 'Get an instant safety rating and clear explanation of potential risks.' },
  { num: '4', title: 'Stay Safe', desc: 'Follow guided actions to block threats and protect your assets.' },
];

const stats = [
  { value: '1000+', label: 'Messages Scanned' },
  { value: '98%', label: 'Accuracy Rate' },
  { value: '3+', label: 'Languages Supported' },
  { value: '24/7', label: 'Active Protection' },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-32 pb-12">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 mb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h1 className="text-3xl md:text-5xl font-bold text-on-background mb-6 leading-tight">
                Protect Your Money with <span className="text-primary">AI</span>
              </h1>
              <p className="text-lg text-on-surface-variant mb-8 max-w-lg">
                Detect scams before they happen. Safe digital banking for everyone, powered by intelligent threat analysis.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/scam-analyzer" className="bg-primary text-on-primary px-8 py-3 rounded-xl text-sm font-semibold shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl">security_update_warning</span>
                  Check Scam
                </Link>
                <Link href="/learn" className="bg-surface border border-primary text-primary px-8 py-3 rounded-xl text-sm font-semibold hover:bg-primary-fixed/20 transition-all duration-300">
                  Learn Safety
                </Link>
              </div>
            </div>
            <div className="relative animate-fade-in-up delay-100 hidden md:block">
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl scale-150"></div>
              <div className="relative z-10 w-full max-w-md mx-auto">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-8 border border-primary/10">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-glow">
                      <span className="material-symbols-outlined text-5xl text-primary icon-fill">shield_locked</span>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-primary mb-1">AI Shield Active</div>
                      <div className="text-xs text-on-surface-variant">Monitoring all transactions</div>
                    </div>
                    <div className="w-full bg-surface-container rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-success text-sm">check_circle</span><span className="text-xs text-on-surface-variant">SMS Protection Active</span></div>
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-success text-sm">check_circle</span><span className="text-xs text-on-surface-variant">UPI Monitoring Active</span></div>
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-success text-sm">check_circle</span><span className="text-xs text-on-surface-variant">QR Scanner Ready</span></div>
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-success text-sm">check_circle</span><span className="text-xs text-on-surface-variant">Voice Analysis Ready</span></div>
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
                <div key={i} className={`bg-surface p-6 rounded-2xl shadow-xl hover:-translate-y-1 transition-transform animate-fade-in-up delay-${i}00`}>
                  <div className="text-primary text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-on-surface-variant text-xs font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 mb-32">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-on-background mb-4">Comprehensive Protection</h2>
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
              Advanced AI-powered security features designed to keep your digital assets and transactions safe from evolving threats.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className={`bg-surface p-8 rounded-3xl border border-outline-variant/10 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 animate-fade-in-up delay-${i}00`}>
                <div className={`bg-${f.color}-container/20 w-14 h-14 rounded-2xl flex items-center justify-center text-${f.color} mb-6`}>
                  <span className="material-symbols-outlined text-3xl">{f.icon}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-on-surface">{f.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-surface-container py-12 mb-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="text-3xl font-bold text-on-background mb-4">How It Works</h2>
              <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
                Simple steps to ensure your financial safety. Our AI does the heavy lifting while you stay protected.
              </p>
            </div>
            <div className="relative">
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-outline-variant/30 -translate-y-1/2 z-0"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                {steps.map((step, i) => (
                  <div key={i} className={`flex flex-col items-center text-center animate-fade-in-up delay-${i}00`}>
                    <div className="bg-primary text-on-primary w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mb-6 shadow-lg">{step.num}</div>
                    <h4 className="text-xl font-semibold mb-2">{step.title}</h4>
                    <p className="text-sm text-on-surface-variant">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FAB />
    </div>
  );
}
