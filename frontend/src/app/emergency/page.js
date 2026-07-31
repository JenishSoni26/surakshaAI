'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';

export default function EmergencyPage() {
  const { t, lang } = useLanguage();
  const [contacts, setContacts] = useState([]);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    api.getContacts().then(d => setContacts(d.contacts)).catch(console.error);
  }, []);

  const safetyTips = [
    '🔒 Never share your OTP, PIN, or CVV with anyone — not even your bank!',
    '🚨 Report fraud within the first hour — the "golden window" for fund recovery.',
    '📱 Government agencies NEVER ask for money transfers over calls.',
    '🛡️ Always verify UPI IDs before sending money to unknown contacts.',
    '⚠️ If a deal sounds too good to be true, it probably is — stay alert!',
    '📞 National Cyber Crime Helpline: 1930 — Available 24/7',
  ];

  useEffect(() => {
    const interval = setInterval(() => setTickerIndex(prev => (prev + 1) % safetyTips.length), 4000);
    return () => clearInterval(interval);
  }, [safetyTips.length]);

  const copyToClipboard = (text, id) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const quickActions = [
    { icon: 'report', title: t('emerg.h1930Title'), desc: t('emerg.h1930Desc'), gradient: 'from-red-500 to-orange-500', link: 'https://cybercrime.gov.in' },
    { icon: 'call', title: t('emerg.call1930'), desc: t('emerg.h1930Title'), gradient: 'from-blue-500 to-cyan-500', link: 'tel:1930' },
    { icon: 'verified_user', title: t('emerg.freezeTitle'), desc: t('emerg.freezeDesc'), gradient: 'from-emerald-500 to-teal-500', link: '#fraud-guide' },
  ];

  const iconColors = {
    shield: 'bg-primary/10 text-primary',
    account_balance: 'bg-secondary-container/30 text-secondary',
    local_police: 'bg-error-container/30 text-error',
    support: 'bg-tertiary-container/20 text-tertiary',
    security: 'bg-primary-fixed text-primary',
    credit_card: 'bg-surface-container-high text-on-surface-variant'
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <style jsx>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.9); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 0.3; }
          100% { transform: scale(0.9); opacity: 0.7; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes slide-up {
          0% { transform: translateY(12px); opacity: 0; }
          15% { transform: translateY(0); opacity: 1; }
          85% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-12px); opacity: 0; }
        }
        .pulse-ring { animation: pulse-ring 2s ease-in-out infinite; }
        .float-anim { animation: float 3s ease-in-out infinite; }
        .ticker-item { animation: slide-up 4s ease-in-out; }
        .quick-card:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
      `}</style>

      <main className="flex-grow pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">

          {/* Hero Section */}
          <div className="text-center mb-10 animate-fade-in-up">
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full bg-error/20 pulse-ring" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-error to-red-700 flex items-center justify-center shadow-lg shadow-error/30 float-anim">
                <span className="material-symbols-outlined text-4xl text-white">emergency</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-3">{t('emerg.title')}</h1>
            <p className="text-on-surface-variant max-w-xl mx-auto text-sm">{t('emerg.subtitle')}</p>
          </div>

          {/* Live Safety Ticker */}
          <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 rounded-2xl px-5 py-3.5 mb-8 animate-fade-in-up delay-100">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
              </span>
              <div className="overflow-hidden h-6 flex-1">
                <p key={tickerIndex} className="text-sm font-medium text-on-surface ticker-item whitespace-nowrap">
                  {safetyTips[tickerIndex]}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 animate-fade-in-up delay-100">
            {quickActions.map((action, i) => (
              <a key={i} href={action.link}
                 target={action.link.startsWith('http') ? '_blank' : undefined}
                 rel={action.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                 className="quick-card group relative overflow-hidden rounded-2xl p-5 text-white transition-all duration-300 cursor-pointer block no-underline"
                 style={{ background: `linear-gradient(135deg, var(--tw-gradient-from, #ef4444), var(--tw-gradient-to, #f97316))` }}>
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-100`} />
                <div className="relative z-10">
                  <span className="material-symbols-outlined text-3xl mb-3 block drop-shadow-md">{action.icon}</span>
                  <h3 className="text-base font-bold mb-1">{action.title}</h3>
                  <p className="text-xs text-white/80 leading-relaxed">{action.desc}</p>
                </div>
              </a>
            ))}
          </div>

          {/* Emergency Contacts */}
          <h2 className="text-xl font-bold mb-4 animate-fade-in-up delay-200 flex items-center gap-2">
            <span className="material-symbols-outlined text-error">contact_phone</span>
            {t('emerg.helplinesTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {contacts.map((c) => (
              <div key={c.id} className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/10 p-5 hover:-translate-y-1 transition-all duration-300 animate-fade-in-up">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColors[c.icon] || 'bg-surface-container text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined text-2xl">{c.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-on-surface mb-1">{c.name}</h3>
                    <p className="text-xs text-on-surface-variant mb-2 leading-relaxed">{c.description}</p>
                    <div className="flex items-center gap-2">
                      <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-bold hover:bg-primary/20 transition-colors">
                        <span className="material-symbols-outlined text-sm">call</span>{c.phone}
                      </a>
                      <button
                        onClick={() => copyToClipboard(c.phone, c.id)}
                        className="inline-flex items-center gap-1 bg-surface-container-high text-on-surface-variant px-2.5 py-1.5 rounded-full text-xs font-semibold hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Copy phone number"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {copiedId === c.id ? 'check' : 'content_copy'}
                        </span>
                        {copiedId === c.id ? (lang === 'hi' ? 'कॉपी किया' : lang === 'gu' ? 'કોપી થયું' : 'Copied') : (lang === 'hi' ? 'कॉपी' : lang === 'gu' ? 'કોપી' : 'Copy')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Fraud Reporting Guide */}
          <div id="fraud-guide" className="bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 p-6 animate-fade-in-up delay-400">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">description</span>
              {t('emerg.freezeTitle')}
            </h2>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Document Everything', desc: 'Screenshot messages, save call logs, note transaction IDs and timestamps.' },
                { step: '2', title: 'Contact Your Bank', desc: 'Call your bank\'s fraud helpline immediately to block cards and freeze suspicious transactions.' },
                { step: '3', title: 'Report to Cyber Crime', desc: 'Call 1930 or file online complaint at cybercrime.gov.in within 24 hours.' },
                { step: '4', title: 'File a Police FIR', desc: 'Visit your nearest police station with all evidence to file a First Information Report.' },
                { step: '5', title: 'Follow Up', desc: 'Track your complaint status and follow up with both bank and police regularly.' },
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold flex-shrink-0">{s.step}</div>
                  <div><h4 className="text-sm font-bold text-on-surface mb-0.5">{s.title}</h4><p className="text-xs text-on-surface-variant">{s.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <FAB />
    </div>
  );
}
