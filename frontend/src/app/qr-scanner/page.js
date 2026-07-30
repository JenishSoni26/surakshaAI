'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import RiskResultCard from '@/components/RiskResultCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';

export default function QRScannerPage() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { t, lang } = useLanguage();

  const handleScan = async () => {
    if (!url.trim()) return;
    setLoading(true); setResult(null);
    try { const data = await api.scanQR(url, lang); setResult(data); } catch (err) { setResult({ error: err.message }); } finally { setLoading(false); }
  };

  const samples = ['http://free-recharge-offer.tk/claim', 'upi://pay?pa=verified-shop@paytm&pn=VerifiedShop&am=200', 'https://pay.suspicious-merchant.xyz/collect?amt=5000'];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10 animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-tertiary-container/20 mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-tertiary">qr_code_scanner</span>
            </div>
            <h1 className="text-3xl font-bold mb-3">{t('qr.title')}</h1>
            <p className="text-on-surface-variant max-w-xl mx-auto">{t('qr.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 p-6 animate-fade-in-up delay-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">link</span>{t('qr.inputLabel')}</h2>
              <div className="bg-surface-container rounded-2xl p-8 mb-4 flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/30">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3">qr_code_2</span>
                <p className="text-xs text-on-surface-variant text-center">{t('qr.pasteNote')}<br/>{t('qr.orUPI')}</p>
              </div>
              <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder={t('qr.placeholder')}
                onKeyDown={e => e.key === 'Enter' && handleScan()}
                className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all mb-4" />
              <div className="flex flex-wrap gap-2 mb-4">
                {samples.map((s, i) => (
                  <button key={i} onClick={() => setUrl(s)} className="text-xs bg-surface-container px-3 py-1.5 rounded-full text-on-surface-variant hover:bg-primary-fixed/30 hover:text-primary transition-colors truncate max-w-[200px]">{s.substring(0, 30)}...</button>
                ))}
              </div>
              <button onClick={handleScan} disabled={loading || !url.trim()}
                className="w-full bg-primary text-on-primary py-3 rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><span className="material-symbols-outlined animate-spin">progress_activity</span>{t('qr.scanningBtn')}</> : <><span className="material-symbols-outlined">qr_code_scanner</span>{t('qr.scanBtn')}</>}
              </button>
            </div>

            <div className="bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 p-6 animate-fade-in-up delay-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">analytics</span>{t('qr.resultsTitle')}</h2>
              {!result && !loading && (
                <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl mb-3 opacity-30">qr_code</span>
                  <p className="text-sm">{t('qr.resultsPlaceholder')}</p>
                </div>
              )}
              {result && !result.error && (
                <RiskResultCard riskScore={result.risk_score} status={result.status} threatType={result.threat_type} aiExplanation={result.ai_explanation} />
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
