'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { getRiskTier } from '@/lib/riskStyles';
import { useFeatureAuth } from '@/lib/featureAuth';
import RiskResultCard from '@/components/RiskResultCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';

export default function UPIGuardianPage() {
  const [upiId, setUpiId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const { t, lang } = useLanguage();
  const { requireAuth } = useFeatureAuth();

  const handleVerify = requireAuth(async () => {
    const trimmed = upiId.trim();
    if (!trimmed) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await api.scanUPI(trimmed, lang);
      setResult(data);
      setHistory(prev => [{ upiId: trimmed.toLowerCase(), ...data, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 5));
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  });

  const sampleUPIs = ['flipkart@axl', 'merchant@ybl', 'random123@xyz'];

  const getResultLevel = (riskScore) => {
    const tier = getRiskTier(riskScore);
    return { label: t(tier.labelKey) || tier.fallbackLabel, tier };
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10 animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-primary">account_balance_wallet</span>
            </div>
            <h1 className="text-3xl font-bold text-on-background mb-3">{t('upi.title')}</h1>
            <p className="text-on-surface-variant max-w-xl mx-auto">{t('upi.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 p-6 animate-fade-in-up delay-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">credit_card</span>
                {t('upi.enterLabel')}
              </h2>
              <input
                type="text"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                placeholder={t('upi.placeholder')}
                className="w-full bg-surface-container rounded-2xl px-4 py-3 text-sm border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all mb-4"
              />
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs text-on-surface-variant font-semibold">{t('upi.trySamples')}</span>
                {sampleUPIs.map((id, i) => (
                  <button key={i} onClick={() => setUpiId(id)}
                    className="text-xs bg-surface-container px-3 py-1.5 rounded-full text-on-surface-variant hover:bg-primary-fixed/30 hover:text-primary transition-colors">
                    {id}
                  </button>
                ))}
              </div>
              <button onClick={handleVerify} disabled={loading || !upiId.trim()}
                className="w-full btn-primary py-3 rounded-full font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
                {loading ? (
                  <><span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>{t('upi.verifying')}</>
                ) : (
                  <><span className="material-symbols-outlined text-lg">verified_user</span>{t('upi.verifyBtn')}</>
                )}
              </button>
            </div>

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
