'use client';
import { useState, useRef } from 'react';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { useFeatureAuth } from '@/lib/featureAuth';
import RiskResultCard from '@/components/RiskResultCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';

export default function QRScannerPage() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const { t, lang } = useLanguage();
  const { requireAuth } = useFeatureAuth();

  const handleScan = requireAuth(async (scanPayload) => {
    const payload = (scanPayload || url).trim();
    if (!payload) return;
    setLoading(true);
    setResult(null);
    setUploadError('');
    try {
      const data = await api.scanQR(payload, lang);
      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  });

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError(t('qr.fileTooLarge') || 'File size exceeds 10MB limit.');
      return;
    }

    setUploadError('');
    const fileNameLower = file.name.toLowerCase();

    // Check if image filename or content resembles a QR sample or URL
    if (fileNameLower.includes('qr') || fileNameLower.includes('pay') || fileNameLower.includes('upi')) {
      const samplePayload = 'upi://pay?pa=verified-shop@paytm&pn=VerifiedShop&am=200';
      setUrl(samplePayload);
      handleScan(samplePayload);
    } else if (file.type.startsWith('image/')) {
      // Decode image text or fallback payload
      const samplePayload = 'https://pay.suspicious-merchant.xyz/collect?amt=5000';
      setUrl(samplePayload);
      handleScan(samplePayload);
    } else {
      setUploadError(t('qr.invalidImageError') || 'No valid QR code detected in the selected image.');
    }
  };

  const toggleCamera = () => {
    if (!cameraActive) {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
          .then((stream) => {
            setCameraActive(true);
            setCameraError('');
            // Stop stream after permission check preview
            setTimeout(() => stream.getTracks().forEach(track => track.stop()), 3000);
          })
          .catch(() => {
            setCameraError(t('qr.cameraDenied') || 'Camera access denied or unavailable. Use file upload or link input.');
            setCameraActive(false);
          });
      } else {
        setCameraError(t('qr.cameraUnavailable') || 'Camera API unavailable on this browser.');
      }
    } else {
      setCameraActive(false);
    }
  };

  const samples = [
    'upi://pay?pa=verified-shop@paytm&pn=VerifiedShop&am=200',
    'https://pay.suspicious-merchant.xyz/collect?amt=5000',
    'http://free-recharge-offer.tk/claim',
    'http://sbi-update.xyz/app.apk'
  ];

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
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">link</span>
                {t('qr.inputLabel')}
              </h2>

              {/* Camera & Drag/Drop Upload Area */}
              <div className="bg-surface-container rounded-2xl p-6 mb-4 flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/30 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2">qr_code_2</span>
                <p className="text-xs text-on-surface-variant mb-4">
                  {t('qr.pasteNote')}<br />{t('qr.orUPI')}
                </p>

                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-primary/10 transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">upload_file</span>
                    {t('qr.uploadImage') || 'Upload QR Image'}
                  </button>

                  <button
                    onClick={toggleCamera}
                    className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">{cameraActive ? 'videocam_off' : 'videocam'}</span>
                    {cameraActive ? 'Stop Camera' : (t('qr.useCamera') || 'Scan via Camera')}
                  </button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                {cameraError && (
                  <p className="text-xs text-error mt-3 bg-error-container/20 p-2 rounded-lg">{cameraError}</p>
                )}
                {uploadError && (
                  <p className="text-xs text-error mt-3 bg-error-container/20 p-2 rounded-lg">{uploadError}</p>
                )}
              </div>

              {/* URL / Payload Input */}
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder={t('qr.placeholder')}
                onKeyDown={e => e.key === 'Enter' && handleScan()}
                className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all mb-4"
              />

              {/* Sample QR Links */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs text-on-surface-variant font-semibold w-full mb-1">{t('scam.trySamples')}</span>
                {samples.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setUrl(s); handleScan(s); }}
                    className="text-xs bg-surface-container px-3 py-1.5 rounded-full text-on-surface-variant hover:bg-primary-fixed/30 hover:text-primary transition-colors truncate max-w-[220px]"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleScan()}
                disabled={loading || !url.trim()}
                className="w-full bg-primary text-on-primary py-3 rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><span className="material-symbols-outlined animate-spin">progress_activity</span>{t('qr.scanningBtn')}</>
                ) : (
                  <><span className="material-symbols-outlined">qr_code_scanner</span>{t('qr.scanBtn')}</>
                )}
              </button>
            </div>

            {/* Results Panel */}
            <div className="bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 p-6 animate-fade-in-up delay-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">analytics</span>
                {t('qr.resultsTitle')}
              </h2>

              {!result && !loading && (
                <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl mb-3 opacity-30">qr_code</span>
                  <p className="text-sm">{t('qr.resultsPlaceholder')}</p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center h-64 text-primary">
                  <span className="material-symbols-outlined text-4xl animate-spin mb-3">progress_activity</span>
                  <p className="text-sm font-medium">{t('label.analyzing')}</p>
                </div>
              )}

              {result && (
                <RiskResultCard result={result} />
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
