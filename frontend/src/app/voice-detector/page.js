
'use client';
import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { extractAudioFeatures } from '@/lib/audioAnalysis';
import RiskResultCard from '@/components/RiskResultCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';

const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15MB

export default function VoiceDetectorPage() {
  const [supportsRecording, setSupportsRecording] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [sourceType, setSourceType] = useState(null); // 'recording' | 'upload'
  const [fileName, setFileName] = useState('');
  const [levels, setLevels] = useState(new Array(24).fill(4));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const { t, lang } = useLanguage();

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const chunksRef = useRef([]);
  const fileInputRef = useRef(null);

  const resetResult = () => { setResult(null); setError(''); };

  function drawLevels() {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    const bars = 24;
    const step = Math.floor(data.length / bars) || 1;
    const next = [];
    for (let i = 0; i < bars; i++) {
      const v = data[i * step] || 0;
      next.push(Math.max(4, Math.round((v / 255) * 56)));
    }
    setLevels(next);
    rafRef.current = requestAnimationFrame(drawLevels);
  }

  function stopVisualizer() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null; }
    setLevels(new Array(24).fill(4));
  }

  useEffect(() => {
    setSupportsRecording(
      typeof window !== 'undefined' &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof window.MediaRecorder !== 'undefined'
    );
    return () => stopVisualizer();
  }, []);

  const startRecording = async () => {
    resetResult();
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyserRef.current = analyser;
      rafRef.current = requestAnimationFrame(drawLevels);

      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setSourceType('recording');
        setFileName('');
        stopVisualizer();
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      setError(t('voice.micDenied'));
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    resetResult();
    if (!file.type.startsWith('audio/')) {
      setError(t('voice.audioTypeError'));
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError(t('voice.fileTooLarge'));
      return;
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(file);
    setAudioUrl(URL.createObjectURL(file));
    setSourceType('upload');
    setFileName(file.name);
  };

  const handleAnalyze = async () => {
    if (!audioBlob) return;
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const features = await extractAudioFeatures(audioBlob);
      const data = await api.scanVoice(features, sourceType, fileName || undefined, lang);

      // Build display metrics from extracted features
      const metrics = [
        { label: 'Pause Ratio', value: `${Math.round(features.silenceRatio * 100)}%`, percent: 100 - Math.min(features.silenceRatio * 100 * 4, 100) },
        { label: 'Loudness Variation', value: features.volumeVariance.toFixed(4), percent: Math.min(features.volumeVariance * 40000, 100) },
        { label: 'Zero-Crossing Rate', value: `${(features.zcr * 100).toFixed(1)}%`, percent: Math.min(features.zcr * 300, 100) },
      ];

      // Add spectral metrics if available
      if (features.spectralFlatness >= 0) {
        metrics.push({ label: 'Spectral Flatness', value: features.spectralFlatness.toFixed(4), percent: Math.min(features.spectralFlatness * 400, 100) });
      }
      if (features.spectralCentroid > 0) {
        metrics.push({ label: 'Spectral Centroid', value: `${features.spectralCentroid.toFixed(0)} Hz`, percent: Math.min((features.spectralCentroid / 5000) * 100, 100) });
      }
      if (features.pitchMean > 0) {
        metrics.push({ label: 'Pitch (F0)', value: `${features.pitchMean.toFixed(0)} Hz ±${features.pitchStd.toFixed(1)}`, percent: Math.min((features.pitchStd / 50) * 100, 100) });
      }
      if (features.mfcc && features.mfcc.length >= 13) {
        const mfccSlice = features.mfcc.slice(1, 13);
        const mfccMean = mfccSlice.reduce((a, b) => a + b, 0) / mfccSlice.length;
        const mfccVar = mfccSlice.reduce((sum, v) => sum + (v - mfccMean) ** 2, 0) / mfccSlice.length;
        metrics.push({ label: 'MFCC Variance', value: mfccVar.toFixed(2), percent: Math.min(mfccVar * 20, 100) });
      }
      if (features.formantSpread > 0) {
        metrics.push({ label: 'Formant Spread', value: `${features.formantSpread.toFixed(0)} Hz`, percent: Math.min((features.formantSpread / 2000) * 100, 100) });
      }

      setResult({ ...data, metrics });
    } catch (err) {
      setError(err.message || 'Could not analyze this audio clip. Try a different file.');
    } finally {
      setLoading(false);
    }
  };

  const clearClip = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setSourceType(null);
    setFileName('');
    resetResult();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10 animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-primary">record_voice_over</span>
            </div>
            <h1 className="text-3xl font-bold mb-3">{t('voice.title')}</h1>
            <p className="text-on-surface-variant max-w-xl mx-auto">{t('voice.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Capture Panel */}
            <div className="bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 p-6 animate-fade-in-up delay-100">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2"><span className="material-symbols-outlined text-primary">mic</span>{t('voice.analysisTitle')}</h2>

              <div className="flex flex-col items-center justify-center py-6">
                {supportsRecording && (
                  <>
                    <button onClick={isRecording ? stopRecording : startRecording} disabled={loading}
                      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                      className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${isRecording ? 'bg-error animate-pulse scale-110' : 'bg-primary hover:scale-105'} text-on-primary disabled:opacity-50`}>
                      <span className="material-symbols-outlined text-5xl">{isRecording ? 'stop' : 'mic'}</span>
                    </button>
                    <p className="text-sm text-on-surface-variant mt-6">{isRecording ? t('voice.recording') : t('voice.tapToRecord')}</p>
                    <div className="flex items-end gap-1 mt-4 h-14" aria-hidden="true">
                      {levels.map((h, i) => (
                        <div key={i} className={`w-1.5 rounded-full transition-all ${isRecording ? 'bg-error' : 'bg-outline-variant/40'}`} style={{ height: `${h}px` }}></div>
                      ))}
                    </div>
                    <div className="text-xs text-on-surface-variant my-4">{t('voice.or')}</div>
                  </>
                )}

                <button onClick={() => fileInputRef.current?.click()} disabled={loading || isRecording}
                  className="bg-surface-container hover:bg-surface-container-high text-on-surface px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50">
                  <span className="material-symbols-outlined text-lg">upload_file</span>{t('voice.uploadBtn')}
                </button>
                <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileSelect} className="hidden" />
                {!supportsRecording && (
                  <p className="text-xs text-on-surface-variant mt-3 text-center">{t('voice.noMicMsg')}</p>
                )}
              </div>

              {audioUrl && (
                <div className="bg-surface-container rounded-2xl p-4 mb-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">graphic_eq</span>
                  <audio src={audioUrl} controls className="flex-1 h-10" />
                  <button onClick={clearClip} aria-label="Remove clip" className="text-on-surface-variant hover:text-error transition-colors">
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
              )}

              {error && (
                <div className="bg-error-container/20 text-error rounded-xl p-3 text-xs mb-4 flex items-start gap-2">
                  <span className="material-symbols-outlined text-base shrink-0">error</span>{error}
                </div>
              )}

              <button onClick={handleAnalyze} disabled={!audioBlob || loading}
                className="w-full bg-primary text-on-primary py-3 rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-4">
                {loading ? <><span className="material-symbols-outlined animate-spin">progress_activity</span>{t('voice.analyzingBtn')}</> : <><span className="material-symbols-outlined">radar</span>{t('voice.analyzeBtn')}</>}
              </button>

              <div className="bg-surface-container rounded-2xl p-4 text-xs text-on-surface-variant space-y-2">
                <p className="font-semibold text-on-surface">{t('voice.howItWorks')}</p>
                <p>{t('voice.step1')}</p>
                <p>{t('voice.step2')}</p>
                <p>{t('voice.step3')}</p>
                <p>{t('voice.step4')}</p>
                <p>{t('voice.step5')}</p>
                <p>{t('voice.step6')}</p>
                <p>{t('voice.step7')}</p>
                <p>{t('voice.step8')}</p>
              </div>
            </div>

            {/* Results Panel */}
            <div className="bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 p-6 animate-fade-in-up delay-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">analytics</span>{t('voice.resultsTitle')}</h2>
              {!result && !loading && (
                <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl mb-3 opacity-30">graphic_eq</span>
                  <p className="text-sm text-center">{t('voice.resultsPlaceholder')}</p>
                </div>
              )}
              {loading && (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-pulse-glow">
                    <span className="material-symbols-outlined text-3xl text-primary animate-spin">progress_activity</span>
                  </div>
                  <p className="text-sm text-on-surface-variant">{t('voice.analyzing')}</p>
                </div>
              )}
              {result && <RiskResultCard riskScore={result.risk_score} status={result.status} threatType={result.threat_type} aiExplanation={result.ai_explanation} metrics={result.metrics} />}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <FAB />
    </div>
  );
}
