'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { getRiskTier } from '@/lib/riskStyles';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';

export default function UPIGuardianPage() {
  const [upiId, setUpiId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const { t, lang } = useLanguage();

  const handleVerify = async () => {
    if (!upiId.trim()) return;
    setLoading(true);
    try {
      const data = await api.scanUPI(upiId, lang);
      setResult(data);
      setHistory(prev => [{ upiId, ...data, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 5));
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const sampleUPIs = ['flipkart@axl', 'merchant@ybl', 'random123@xyz'];

  // Get level label for the result
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
            <div className="w-16 h-16 rounded-full bg-secondary-container/30 mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-secondary">account_balance_wallet</span>
            </div>
            <h1 className="text-3xl font-bold mb-3">{t('upi.title')}</h1>
            <p className="text-on-surface-variant max-w-xl mx-auto">{t('upi.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Verification Panel */}
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 p-6 animate-fade-in-up delay-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">verified_user</span>{t('upi.verifyLabel')}</h2>
              <div className="flex gap-3 mb-4">
                <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder={t('upi.placeholder')}
                  onKeyDown={e => e.key === 'Enter' && handleVerify()}
                  className="flex-1 bg-surface-container rounded-xl px-4 py-3 text-sm border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                <button onClick={handleVerify} disabled={loading || !upiId.trim()}
                  className="bg-primary text-on-primary px-6 py-3 rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2">
                  {loading ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined">search</span>}
                  {t('upi.verifyBtn')}
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {sampleUPIs.map((s, i) => (
                  <button key={i} onClick={() => setUpiId(s)} className="text-xs bg-surface-container px-3 py-1.5 rounded-full text-on-surface-variant hover:bg-primary-fixed/30 hover:text-primary transition-colors">{s}</button>
                ))}
              </div>

              {/* Result */}
              {result && !result.error && (() => {
                const { label: levelLabel, tier } = getResultLevel(result.risk_score);
                return (
                  <div className="animate-fade-in-up">
                    <div className={`rounded-2xl p-6 ${result.status === 'verified' ? 'bg-success/5 border border-success/20' : result.status === 'blocked' ? 'bg-error-container/20 border border-error/20' : 'bg-tertiary-container/10 border border-tertiary/20'}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`material-symbols-outlined text-3xl ${result.status === 'verified' ? 'text-success' : result.status === 'blocked' ? 'text-error' : 'text-tertiary'} icon-fill`}>
                          {result.status === 'verified' ? 'verified_user' : result.status === 'blocked' ? 'gpp_bad' : 'warning'}
                        </span>
                        <div>
                          <div className="font-bold text-on-surface">{upiId}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs font-semibold ${result.status === 'verified' ? 'text-success' : result.status === 'blocked' ? 'text-error' : 'text-tertiary'}`}>{result.status.toUpperCase()}</span>
                            <span className="text-on-surface-variant text-xs">—</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${tier.badgeAccent}`}>
                              <span className="material-symbols-outlined text-xs icon-fill">{tier.icon}</span>
                              {levelLabel}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-surface/60 rounded-xl p-4 border-l-4 border-primary">
                        <p className="text-sm text-on-surface-variant leading-relaxed">{result.ai_explanation}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Monitoring Status */}
            <div className="space-y-6">
              <div className="bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 p-6 animate-fade-in-up delay-200">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-success text-lg">wifi_tethering</span>{t('upi.monitorTitle')}</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-success">{t('upi.active')}</span>
                </div>
                <div className="space-y-3 text-xs text-on-surface-variant">
                  <div className="flex justify-between"><span>{t('upi.scansToday')}</span><span className="font-bold text-on-surface">{history.length + 5}</span></div>
                  <div className="flex justify-between"><span>{t('upi.threatsBlocked')}</span><span className="font-bold text-error">2</span></div>
                  <div className="flex justify-between"><span>{t('upi.safeTransactions')}</span><span className="font-bold text-success">12</span></div>
                </div>
              </div>

              {history.length > 0 && (
                <div className="bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 p-6 animate-fade-in-up delay-300">
                  <h3 className="text-sm font-semibold mb-3">{t('upi.recentChecks')}</h3>
                  <div className="space-y-2">
                    {history.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className={`material-symbols-outlined text-sm ${h.status === 'verified' ? 'text-success' : 'text-tertiary'}`}>
                          {h.status === 'verified' ? 'check_circle' : 'warning'}
                        </span>
                        <span className="font-medium text-on-surface truncate flex-1">{h.upiId}</span>
                        <span className="text-on-surface-variant">{h.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <FAB />
    </div>
  );
}
