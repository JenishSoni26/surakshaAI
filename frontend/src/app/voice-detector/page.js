'use client';
import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
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
      } catch (e) {
        console.error('Error stopping stream tracks:', e);
      }
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch (e) {}
      audioCtxRef.current = null;
    }
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
      stopVisualizer();
      setError('Microphone access was denied or unavailable. You can upload an audio file instead.');
    }
  };

  const stopRecording = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } catch (e) {
      console.error('Error stopping recorder:', e);
    } finally {
      setIsRecording(false);
      stopVisualizer();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    resetResult();
    if (!file.type.startsWith('audio/')) {
      setError('Please choose an audio file (mp3, wav, m4a, ogg, webm...).');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError('File is too large. Please choose an audio clip under 15MB.');
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

  const runAnalysis = async () => {
    if (!audioBlob) return;
    setLoading(true);
    resetResult();
    try {
      const features = await extractAudioFeatures(audioBlob);
      const res = await api.scanVoice(features, sourceType, fileName);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Voice analysis failed. Please try a different audio clip.');
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-3xl font-bold text-on-background mb-3">AI Voice Scam Detector</h1>
            <p className="text-on-surface-variant max-w-xl mx-auto">
              Record a live call clip or upload an audio recording. Our multi-signal DSP engine analyzes pitch stability, silence dynamics, spectral flatness, and MFCC patterns to flag AI-synthesized deepfakes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Column */}
            <div className="space-y-6 animate-fade-in-up delay-100">
              {/* Record Card */}
              <div className="bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 p-6">
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">mic</span>Record Live Call Clip
                </h2>
                <p className="text-xs text-on-surface-variant mb-4">
                  Record 3 to 10 seconds of clear speech for the most accurate analysis.
                </p>

                {/* Waveform Visualizer */}
                <div className="bg-surface-container rounded-2xl p-6 mb-4 flex items-center justify-center gap-1 h-24 border border-outline-variant/10">
                  {levels.map((h, i) => (
                    <div
                      key={i}
                      className={`w-1.5 rounded-full transition-all duration-75 ${
                        isRecording ? 'bg-primary shadow-sm' : 'bg-outline-variant/40'
                      }`}
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>

                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    disabled={!supportsRecording || loading}
                    className="w-full bg-primary text-on-primary py-3 rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">fiber_manual_record</span>
                    Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="w-full bg-error text-on-error py-3 rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 animate-pulse"
                  >
                    <span className="material-symbols-outlined">stop</span>
                    Stop & Capture Clip
                  </button>
                )}

                {!supportsRecording && (
                  <p className="text-[11px] text-tertiary mt-2 text-center">
                    Live mic recording is unavailable in this browser context. Please use the file upload option below.
                  </p>
                )}
              </div>

              {/* Upload Card */}
              <div className="bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 p-6">
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">upload_file</span>Upload Audio File
                </h2>
                <p className="text-xs text-on-surface-variant mb-4">
                  Supports MP3, WAV, M4A, OGG, and WebM audio files up to 15MB.
                </p>

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-surface-container rounded-2xl p-6 text-center border-2 border-dashed border-outline-variant/30 hover:border-primary/50 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-4xl text-primary mb-2">audio_file</span>
                  <p className="text-xs font-semibold text-on-surface mb-1">
                    {fileName ? fileName : 'Click or drag & drop audio file here'}
                  </p>
                  <p className="text-[10px] text-on-surface-variant">MP3, WAV, M4A up to 15MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Clip Selected Bar & Analyze Action */}
              {audioUrl && (
                <div className="bg-surface-container-lowest rounded-3xl shadow-xl border border-primary/20 p-6 animate-fade-in space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-primary flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">audiotrack</span>
                        Clip Ready ({sourceType === 'upload' ? 'Uploaded' : 'Recorded'})
                      </p>
                      {fileName && <p className="text-[11px] text-on-surface-variant truncate max-w-[240px]">{fileName}</p>}
                    </div>
                  </div>

                  <audio src={audioUrl} controls className="w-full h-8" />

                  <button
                    onClick={runAnalysis}
                    disabled={loading}
                    className="w-full bg-primary text-on-primary py-3.5 rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        Extracting Acoustic DSP Features...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">equalizer</span>
                        Analyze Voice Clip for Scams
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Results Column */}
            <div className="bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 p-6 animate-fade-in-up delay-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">analytics</span>Voice Analysis Results
              </h2>

              {error && (
                <div className="bg-error-container/20 text-error rounded-2xl p-4 text-xs leading-relaxed mb-4">
                  {error}
                </div>
              )}

              {!result && !loading && !error && (
                <div className="flex flex-col items-center justify-center h-72 text-on-surface-variant text-center">
                  <span className="material-symbols-outlined text-5xl mb-3 opacity-30">graphic_eq</span>
                  <p className="text-sm font-semibold mb-1">No audio clip analyzed yet</p>
                  <p className="text-xs max-w-xs text-on-surface-variant/80">
                    Record a live call clip or upload an audio file, then click Analyze to run spectral DSP threat detection.
                  </p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center h-72 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-glow">
                    <span className="material-symbols-outlined text-3xl text-primary animate-spin">progress_activity</span>
                  </div>
                  <p className="text-sm font-semibold text-on-surface">Running DSP Acoustic Analysis...</p>
                  <p className="text-xs text-on-surface-variant max-w-xs">
                    Evaluating volume dynamics, silence ratios, zero-crossing rate, pitch autocorrelation, spectral flatness, and MFCC variance.
                  </p>
                </div>
              )}

              {result && !loading && (
                <div className="space-y-4">
                  <RiskResultCard
                    riskScore={result.risk_score}
                    status={result.status}
                    threatType={result.threat_type}
                    aiExplanation={result.ai_explanation}
                  />

                  {/* Signal Dimensions Breakdown */}
                  {result.details && result.details.length > 0 && (
                    <div className="bg-surface-container rounded-2xl p-4 space-y-2 border border-outline-variant/10">
                      <p className="text-xs font-bold text-on-surface mb-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-primary">equalizer</span>
                        Extracted Signal Metrics
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {result.details.map((d, i) => (
                          <div key={i} className="bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/10">
                            <span className="text-[10px] text-on-surface-variant block">{d.label}</span>
                            <span className="font-bold text-on-surface text-xs">{d.value}</span>
                            {d.note && (
                              <span className={`block text-[9px] font-semibold ${d.note.includes('abnormal') || d.note.includes('too clean') || d.note.includes('monotone') ? 'text-error' : 'text-success'}`}>
                                {d.note}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
