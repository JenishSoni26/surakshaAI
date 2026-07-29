'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';
import Link from 'next/link';

// Class names are written out in full per color so Tailwind's build-time
// scanner can find them - a dynamically interpolated `bg-${color}-container`
// would be silently missing from production CSS.
const FEATURE_COLOR_CLASSES = {
  primary: 'bg-primary-container/20 text-primary',
  secondary: 'bg-secondary-container/20 text-secondary',
  tertiary: 'bg-tertiary-container/20 text-tertiary',
  error: 'bg-error-container/20 text-error',
};

const features = [
  { icon: 'psychology', title: 'AI Scam Detection', desc: 'Analyze suspicious SMS, emails, and messages for fraud patterns and phishing links.', color: 'primary' },
  { icon: 'account_balance_wallet', title: 'UPI Guardian', desc: 'Real-time monitoring of UPI requests and transaction verification for complete peace of mind.', color: 'secondary' },
  { icon: 'qr_code_scanner', title: 'QR Code Scanner', desc: 'Scan QR codes before interacting to identify malicious links or unauthorized payment destinations.', color: 'tertiary' },
  { icon: 'record_voice_over', title: 'Voice Scam Detection', desc: 'Record or upload a call clip and detect audio patterns typical of synthetic or cloned voices.', color: 'primary' },
  { icon: 'school', title: 'Financial Literacy', desc: 'Interactive lessons and quizzes to help you recognize and avoid the latest financial scams.', color: 'secondary' },
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

        {/* Voice Scam Detection CTA Section */}
        <section className="max-w-7xl mx-auto px-4 mb-32">
          <Link href="/voice-detector" className="block group">
            <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-surface to-tertiary-container/20 rounded-3xl border border-primary/15 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
              {/* Background glow effects */}
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
              <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-tertiary/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-12 items-center">
                {/* Left: Content */}
                <div className="animate-fade-in-up">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-primary icon-fill">record_voice_over</span>
                    </div>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">New Feature</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-on-background mb-3">
                    AI Voice Scam Detector
                  </h2>
                  <p className="text-on-surface-variant mb-6 leading-relaxed">
                    Got a suspicious call? Record it or upload the clip — our engine analyzes 11 signal dimensions to detect AI-generated and cloned voices in real time.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    {[
                      { icon: 'graphic_eq', text: 'FFT Spectral Analysis' },
                      { icon: 'music_note', text: 'Pitch (F0) Tracking' },
                      { icon: 'equalizer', text: '13-Band MFCC Extraction' },
                      { icon: 'voice_selection', text: 'Formant Detection' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-primary text-base">{item.icon}</span>
                        {item.text}
                      </div>
                    ))}
                  </div>
                  <div className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-3 rounded-xl text-sm font-bold shadow-lg group-hover:shadow-xl group-hover:scale-[1.02] transition-all duration-300">
                    <span className="material-symbols-outlined text-xl">mic</span>
                    Try Voice Detector
                    <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>

                {/* Right: Animated Soundwave Visualizer */}
                <div className="flex flex-col items-center justify-center animate-fade-in-up delay-200">
                  <div className="relative w-full max-w-xs">
                    {/* Soundwave visualization */}
                    <div className="bg-surface-container-lowest/80 backdrop-blur-sm rounded-3xl p-8 border border-outline-variant/10 shadow-lg">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-error animate-pulse"></div>
                        <span className="text-xs font-semibold text-on-surface-variant">Analyzing audio signal...</span>
                      </div>
                      {/* Animated bars */}
                      <div className="flex items-end justify-center gap-1 h-24 mb-6">
                        {[35, 55, 25, 70, 45, 85, 30, 60, 40, 75, 20, 50, 65, 35, 80, 45, 55, 30, 70, 40].map((h, i) => (
                          <div key={i}
                            className="w-1.5 rounded-full bg-primary/70"
                            style={{
                              height: `${h}%`,
                              animation: `soundwave 1.2s ease-in-out ${i * 0.06}s infinite alternate`,
                            }}
                          ></div>
                        ))}
                      </div>
                      {/* Feature readouts */}
                      <div className="space-y-2">
                        {[
                          { label: 'Spectral Flatness', value: '0.0821', bar: 32 },
                          { label: 'Pitch Stability', value: '±24.3 Hz', bar: 68 },
                          { label: 'MFCC Variance', value: '4.82', bar: 85 },
                        ].map((item, i) => (
                          <div key={i}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-on-surface-variant">{item.label}</span>
                              <span className="font-bold text-on-surface">{item.value}</span>
                            </div>
                            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-primary transition-all duration-1000"
                                style={{ width: `${item.bar}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center gap-2 bg-success/10 rounded-xl px-3 py-2">
                        <span className="material-symbols-outlined text-success text-base">check_circle</span>
                        <span className="text-xs font-semibold text-success">Human voice — 94% confidence</span>
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
            <h2 className="text-3xl font-bold text-on-background mb-4">Comprehensive Protection</h2>
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
              Advanced AI-powered security features designed to keep your digital assets and transactions safe from evolving threats.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className={`bg-surface p-8 rounded-3xl border border-outline-variant/10 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 animate-fade-in-up delay-${i}00`}>
                <div className={`${FEATURE_COLOR_CLASSES[f.color]} w-14 h-14 rounded-2xl flex items-center justify-center mb-6`}>
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
