'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';

export default function VoiceDetectorPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true); setResult(null);
    // Simulate recording delay
    setIsRecording(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsRecording(false);
    try { const data = await api.scanVoice(); setResult(data); } catch (err) { setResult({ error: err.message }); } finally { setLoading(false); }
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
            <h1 className="text-3xl font-bold mb-3">Voice Scam Detector</h1>
            <p className="text-on-surface-variant max-w-xl mx-auto">Analyze phone calls for deepfake voices, AI-generated speech, and suspicious call patterns.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recording Panel */}
            <div className="bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 p-6 animate-fade-in-up delay-100">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2"><span className="material-symbols-outlined text-primary">mic</span>Voice Analysis</h2>
              <div className="flex flex-col items-center justify-center py-8">
                <button onClick={handleAnalyze} disabled={loading}
                  className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${isRecording ? 'bg-error animate-pulse scale-110' : 'bg-primary hover:scale-105'} text-on-primary`}>
                  <span className="material-symbols-outlined text-5xl">{isRecording ? 'stop' : 'mic'}</span>
                </button>
                <p className="text-sm text-on-surface-variant mt-6">{isRecording ? 'Recording... analyzing voice patterns' : loading ? 'Processing audio...' : 'Tap to simulate voice analysis'}</p>
                {isRecording && (
                  <div className="flex items-center gap-1 mt-4">
                    {[...Array(20)].map((_, i) => (
                      <div key={i} className="w-1 bg-error rounded-full animate-pulse" style={{ height: `${Math.random() * 30 + 5}px`, animationDelay: `${i * 50}ms` }}></div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-surface-container rounded-2xl p-4 text-xs text-on-surface-variant space-y-2 mt-4">
                <p className="font-semibold text-on-surface">How it works:</p>
                <p>• Records or uploads audio from a suspicious call</p>
                <p>• AI analyzes pitch, spectral patterns, and breathing</p>
                <p>• Detects deepfake voices and AI-generated speech</p>
                <p>• Checks caller patterns against known scam databases</p>
              </div>
            </div>

            {/* Results Panel */}
            <div className="bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 p-6 animate-fade-in-up delay-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">analytics</span>Detection Results</h2>
              {!result && !loading && (
                <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl mb-3 opacity-30">graphic_eq</span>
                  <p className="text-sm">Tap the microphone to start analysis</p>
                </div>
              )}
              {result && !result.error && (
                <div className="space-y-4 animate-fade-in">
                  <div className={`rounded-2xl p-5 text-center ${result.risk_score >= 70 ? 'bg-error-container/20' : result.risk_score >= 40 ? 'bg-tertiary-container/10' : 'bg-success/5'}`}>
                    <div className={`text-4xl font-bold mb-1 ${result.risk_score >= 70 ? 'text-error' : result.risk_score >= 40 ? 'text-tertiary' : 'text-success'}`}>{result.risk_score}/100</div>
                    <div className={`text-sm font-semibold ${result.risk_score >= 70 ? 'text-error' : result.risk_score >= 40 ? 'text-tertiary' : 'text-success'}`}>Deepfake Probability</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-on-surface-variant">Detection:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${result.status === 'blocked' ? 'bg-error-container text-on-error-container' : result.status === 'flagged' ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-success/10 text-success'}`}>{result.threat_type}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs"><span className="text-on-surface-variant">Pitch Analysis</span><span className="font-bold">{result.risk_score > 50 ? 'Anomalous' : 'Normal'}</span></div>
                    <div className="w-full bg-surface-container-high h-2 rounded-full"><div className={`h-full rounded-full ${result.risk_score >= 70 ? 'bg-error' : result.risk_score >= 40 ? 'bg-tertiary' : 'bg-success'}`} style={{ width: `${result.risk_score}%` }}></div></div>
                    <div className="flex justify-between text-xs"><span className="text-on-surface-variant">Spectral Consistency</span><span className="font-bold">{result.risk_score > 60 ? 'Irregular' : 'Consistent'}</span></div>
                    <div className="w-full bg-surface-container-high h-2 rounded-full"><div className={`h-full rounded-full ${result.risk_score >= 70 ? 'bg-error' : result.risk_score >= 40 ? 'bg-tertiary' : 'bg-success'}`} style={{ width: `${Math.min(result.risk_score + 10, 100)}%` }}></div></div>
                  </div>
                  <div className="bg-surface-container rounded-2xl p-4 border-l-4 border-primary">
                    <div className="text-xs font-semibold text-primary mb-2 flex items-center gap-1"><span className="material-symbols-outlined text-sm">smart_toy</span>AI Analysis</div>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{result.ai_explanation}</p>
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
