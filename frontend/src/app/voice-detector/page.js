'use client';
import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { useFeatureAuth } from '@/lib/featureAuth';
import { extractAudioFeatures } from '@/lib/audioAnalysis';
import RiskResultCard from '@/components/RiskResultCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';

const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15MB

export default function VoiceDetectorPage() {
  const [supportsRecording] = useState(() => (
    typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && !!window.MediaRecorder
  ));
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
  const { requireAuth } = useFeatureAuth();

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
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach(t => t.stop());
      } catch (e) {}
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    setLevels(new Array(24).fill(4));
  }

  useEffect(() => {
    return () => {
      stopVisualizer();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    resetResult();
    setError('');
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyserRef.current = analyser;

      drawLevels();

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        chunksRef.current = [];
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setSourceType('recording');
        setFileName('');
        stopVisualizer();
        setIsRecording(false);
      };

      recorder.start(100);
      setIsRecording(true);
    } catch (err) {
      stopVisualizer();
      setIsRecording(false);
      setError(t('voice.micBlocked'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleFileSelect = (e) => {
    resetResult();
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_BYTES) {
      setError(t('voice.fileTooLarge'));
      return;
    }
    if (!file.type.startsWith('audio/') && !/\.(mp3|wav|m4a|aac|ogg|webm|flac)$/i.test(file.name)) {
      setError(t('voice.unsupportedFormat'));
      return;
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(file);
    setAudioUrl(URL.createObjectURL(file));
    setSourceType('upload');
    setFileName(file.name);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const pseudoEvent = { target: { files: [file] } };
      handleFileSelect(pseudoEvent);
    }
  };

  const handleAnalyze = requireAuth(async () => {
    if (!audioBlob) return;
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const features = await extractAudioFeatures(audioBlob);
      const data = await api.scanVoice(features, sourceType, fileName || undefined, lang);

      const metrics = [
        { label: 'Pause Ratio', value: `${Math.round(features.silenceRatio * 100)}%`, percent: 100 - Math.min(features.silenceRatio * 100 * 4, 100) },
        { label: 'Loudness Variation', value: features.volumeVariance.toFixed(4), percent: Math.min(features.volumeVariance * 40000, 100) },
        { label: 'Zero-Crossing Rate', value: `${(features.zcr * 100).toFixed(1)}%`, percent: Math.min(features.zcr * 300, 100) },
      ];

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
      setError(err.message || t('voice.analysisFailed'));
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10 animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-primary">graphic_eq</span>
            </div>
            <h1 className="text-3xl font-bold text-on-background mb-3">{t('voice.title')}</h1>
            <p className="text-on-surface-variant max-w-xl mx-auto">{t('voice.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 p-6 flex flex-col justify-between animate-fade-in-up delay-100">
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">mic</span>
                  {t('voice.inputLabel')}
                </h2>

                <div className="bg-surface-container/60 border border-outline-variant/20 rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base text-primary">mic</span>
                      {t('voice.micRecord')}
                    </span>
                    {isRecording && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-tertiary font-bold animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-tertiary"></span> {t('voice.recordingActive')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-1 h-14 bg-surface-container-lowest rounded-xl px-4 border border-outline-variant/10 mb-3">
                    {levels.map((h, i) => (
                      <span key={i} style={{ height: `${h}px` }}
                        className={`w-1 rounded-full transition-all duration-75 ${isRecording ? 'bg-primary' : 'bg-outline-variant/40'}`} />
                    ))}
                  </div>

                  {supportsRecording ? (
                    !isRecording ? (
                      <button onClick={startRecording} disabled={loading}
                        className="w-full py-2.5 rounded-xl border border-primary/30 text-primary hover:bg-primary/10 transition-colors text-sm font-semibold flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-lg">radio_button_checked</span>
                        {t('voice.startRec')}
                      </button>
                    ) : (
                      <button onClick={stopRecording}
                        className="w-full py-2.5 rounded-xl bg-tertiary-container text-on-tertiary-container hover:bg-tertiary/20 transition-colors text-sm font-semibold flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-lg">stop</span>
                        {t('voice.stopRec')}
                      </button>
                    )
                  ) : (
                    <p className="text-xs text-on-surface-variant/70 text-center">{t('voice.recNotSupported')}</p>
                  )}
                </div>

                <div className="relative flex items-center my-3">
                  <div className="flex-grow border-t border-outline-variant/20"></div>
                  <span className="px-2 text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">{t('voice.orDivider')}</span>
                  <div className="flex-grow border-t border-outline-variant/20"></div>
                </div>

                <div onDragOver={e => e.preventDefault()} onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-outline-variant/30 hover:border-primary/50 bg-surface-container/30 hover:bg-surface-container/60 rounded-2xl p-4 text-center cursor-pointer transition-all mb-4">
                  <input ref={fileInputRef} type="file" accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm,.flac" onChange={handleFileSelect} className="hidden" />
                  <span className="material-symbols-outlined text-2xl text-primary mb-1">cloud_upload</span>
                  <p className="text-xs font-semibold text-on-background mb-0.5">{t('voice.uploadPrompt')}</p>
                  <p className="text-[10px] text-on-surface-variant">{t('voice.fileTypesHint')}</p>
                </div>

                {audioUrl && (
                  <div className="bg-surface-container rounded-2xl p-3 border border-outline-variant/20 mb-4 animate-fade-in">
                    <div className="flex items-center justify-between text-xs text-on-surface-variant mb-2">
                      <span className="font-semibold text-on-background truncate max-w-[200px]">
                        {sourceType === 'recording' ? `🎙️ ${t('voice.recordingLabel')}` : `📄 ${fileName}`}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">{sourceType}</span>
                    </div>
                    <audio src={audioUrl} controls className="w-full h-8" />
                  </div>
                )}

                {error && (
                  <div className="bg-tertiary-container/30 border border-tertiary/20 rounded-xl p-3 text-xs text-tertiary font-semibold mb-4 animate-fade-in">
                    {error}
                  </div>
                )}
              </div>

              <button onClick={handleAnalyze} disabled={loading || !audioBlob}
                className="w-full btn-primary py-3 rounded-full font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 mt-2">
                {loading ? (
                  <><span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>{t('voice.analyzing')}</>
                ) : (
                  <><span className="material-symbols-outlined text-lg">graphic_eq</span>{t('voice.analyzeBtn')}</>
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
