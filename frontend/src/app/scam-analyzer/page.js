'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import RiskResultCard from '@/components/RiskResultCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';

export default function ScamAnalyzerPage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { t, lang } = useLanguage();

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await api.scanMessage(text, lang);
      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const sampleMessages = [
    'Your SBI account has been blocked. Click here to verify: http://sbi-verify.xyz/login',
    'Congratulations! You won ₹10,00,000 in KBC lottery. Send ₹500 processing fee.',
    'Hi, your Flipkart order #12345 has been shipped. Track at flipkart.com/track/12345',
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10 animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-primary">psychology</span>
            </div>
            <h1 className="text-3xl font-bold text-on-background mb-3">{t('scam.title')}</h1>
            <p className="text-on-surface-variant max-w-xl mx-auto">{t('scam.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Panel */}
            <div className="bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 p-6 animate-fade-in-up delay-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">edit_note</span>{t('scam.pasteLabel')}</h2>
              <textarea value={text} onChange={e => setText(e.target.value)} rows={8} placeholder={t('scam.placeholder')}
                className="w-full bg-surface-container rounded-2xl px-4 py-3 text-sm border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none mb-4" />
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs text-on-surface-variant font-semibold">{t('scam.trySamples')}</span>
                {sampleMessages.map((msg, i) => (
                  <button key={i} onClick={() => setText(msg)}
                    className="text-xs bg-surface-container px-3 py-1.5 rounded-full text-on-surface-variant hover:bg-primary-fixed/30 hover:text-primary transition-colors truncate max-w-[200px]">
                    {msg.substring(0, 35)}...
                  </button>
                ))}
              </div>
              <button onClick={handleAnalyze} disabled={loading || !text.trim()}
                className="w-full bg-primary text-on-primary py-3 rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><span className="material-symbols-outlined animate-spin">progress_activity</span>{t('scam.analyzingBtn')}</> : <><span className="material-symbols-outlined">radar</span>{t('scam.analyzeBtn')}</>}
              </button>
            </div>

            {/* Results Panel */}
            <div className="bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 p-6 animate-fade-in-up delay-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">analytics</span>{t('scam.resultsTitle')}</h2>
              {!result && !loading && (
                <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl mb-3 opacity-30">shield_question</span>
                  <p className="text-sm">{t('scam.resultsPlaceholder')}</p>
                </div>
              )}
              {loading && (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-pulse-glow">
                    <span className="material-symbols-outlined text-3xl text-primary animate-spin">progress_activity</span>
                  </div>
                  <p className="text-sm text-on-surface-variant">{t('scam.aiAnalyzing')}</p>
                </div>
              )}
              {result && !result.error && (
                <RiskResultCard riskScore={result.risk_score} status={result.status} threatType={result.threat_type} aiExplanation={result.ai_explanation} />
              )}
              {result?.error && (
                <div className="bg-error-container/20 text-error rounded-2xl p-4 text-sm">{result.error}</div>
              )}
            </div>
          </div>

          {/* Voice Detection Banner */}
          <Link href="/voice-detector" className="block group mt-8 animate-fade-in-up delay-300">
            <div className="bg-gradient-to-r from-primary/5 via-surface to-tertiary-container/10 rounded-2xl border border-primary/10 p-5 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl text-primary icon-fill">record_voice_over</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-on-surface mb-0.5">{t('scam.voiceBanner.title')}</div>
                <div className="text-xs text-on-surface-variant">{t('scam.voiceBanner.desc')}</div>
              </div>
              <span className="material-symbols-outlined text-primary text-xl group-hover:translate-x-1 transition-transform shrink-0">arrow_forward</span>
            </div>
          </Link>
        </div>
      </main>
      <Footer />
      <FAB />
    </div>
  );
}
