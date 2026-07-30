'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { useFeatureAuth } from '@/lib/featureAuth';
import RiskResultCard from '@/components/RiskResultCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';

export default function ScamAnalyzerPage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { t, lang } = useLanguage();
  const { requireAuth } = useFeatureAuth();

  const handleAnalyze = requireAuth(async () => {
    if (!text.trim()) return;
    if (text.length > 2000) {
      setResult({ error: 'Message exceeds maximum allowed length of 2,000 characters. Please trim and try again.' });
      return;
    }
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
  });

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
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">edit_note</span>
                {t('scam.pasteLabel')}
              </h2>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                rows={8}
                maxLength={2000}
                placeholder={t('scam.placeholder')}
                className="w-full bg-surface-container rounded-2xl px-4 py-3 text-sm border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none mb-1"
              />
              <div className="flex justify-between items-center mb-4 text-[10px] text-on-surface-variant">
                <span>Max 2,000 characters</span>
                <span className={text.length >= 1900 ? 'text-tertiary font-bold' : ''}>{text.length}/2000</span>
              </div>
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
                className="w-full btn-primary py-3 rounded-full font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
                {loading ? (
                  <><span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>{t('scam.analyzing')}</>
                ) : (
                  <><span className="material-symbols-outlined text-lg">shield</span>{t('scam.analyzeBtn')}</>
                )}
              </button>
            </div>

            {/* Output Panel */}
            <div className="animate-fade-in-up delay-200">
              <RiskResultCard result={result} loading={loading} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <FAB />
    </div>
  );
}
