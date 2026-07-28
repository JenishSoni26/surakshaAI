'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';

export default function EmergencyPage() {
  const [contacts, setContacts] = useState([]);
  const [freezeResult, setFreezeResult] = useState(null);
  const [freezeLoading, setFreezeLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => { api.getContacts().then(d => setContacts(d.contacts)).catch(console.error); }, []);

  const handleFreeze = async () => {
    setShowConfirm(false);
    setFreezeLoading(true);
    try { const data = await api.freezeAccount('all', 'suspected fraud'); setFreezeResult(data); } catch (err) { console.error(err); } finally { setFreezeLoading(false); }
  };

  const iconColors = { shield: 'bg-primary/10 text-primary', account_balance: 'bg-secondary-container/30 text-secondary', local_police: 'bg-error-container/30 text-error', support: 'bg-tertiary-container/20 text-tertiary', security: 'bg-primary-fixed text-primary', credit_card: 'bg-surface-container-high text-on-surface-variant' };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10 animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-error-container/30 mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-error">emergency</span>
            </div>
            <h1 className="text-3xl font-bold mb-3">Emergency Help Center</h1>
            <p className="text-on-surface-variant max-w-xl mx-auto">Quick access to emergency actions and helpline contacts. Act immediately if you suspect fraud.</p>
          </div>

          {/* Emergency Freeze Button */}
          <div className="bg-error/5 border-2 border-error/20 rounded-3xl p-6 mb-8 text-center animate-fade-in-up delay-100">
            <span className="material-symbols-outlined text-5xl text-error mb-3 block">lock</span>
            <h2 className="text-xl font-bold text-error mb-2">Emergency Account Freeze</h2>
            <p className="text-sm text-on-surface-variant mb-4 max-w-md mx-auto">Immediately freeze all linked accounts to prevent unauthorized transactions. Use this only in genuine emergencies.</p>
            {freezeResult ? (
              <div className="bg-surface rounded-2xl p-4 text-left max-w-md mx-auto animate-fade-in">
                <div className="flex items-center gap-2 mb-3 text-success font-semibold text-sm"><span className="material-symbols-outlined">check_circle</span>{freezeResult.message}</div>
                <div className="text-xs text-on-surface-variant space-y-1">
                  <p><strong>Reference:</strong> {freezeResult.freezeId}</p>
                  <p><strong>Status:</strong> {freezeResult.details?.estimatedCompletion}</p>
                  <p className="font-semibold text-on-surface mt-2">Next Steps:</p>
                  {freezeResult.details?.nextSteps?.map((s, i) => <p key={i}>• {s}</p>)}
                </div>
              </div>
            ) : (
              <button onClick={() => setShowConfirm(true)} disabled={freezeLoading}
                className="bg-error text-on-error px-8 py-3 rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mx-auto">
                {freezeLoading ? <><span className="material-symbols-outlined animate-spin">progress_activity</span>Processing...</> : <><span className="material-symbols-outlined">lock</span>Freeze All Accounts</>}
              </button>
            )}
          </div>

          {/* Confirmation Modal */}
          {showConfirm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="freeze-confirm-title">
              <div className="bg-surface-container-lowest rounded-3xl shadow-2xl p-6 max-w-sm w-full">
                <div className="text-center">
                  <span className="material-symbols-outlined text-5xl text-error mb-3">warning</span>
                  <h3 id="freeze-confirm-title" className="text-lg font-bold text-error mb-2">Confirm Emergency Freeze</h3>
                  <p className="text-sm text-on-surface-variant mb-6">This will freeze all linked bank accounts. Are you sure you want to proceed?</p>
                  <div className="flex gap-3">
                    <button onClick={() => setShowConfirm(false)} className="flex-1 bg-surface-container text-on-surface-variant py-2.5 rounded-xl text-sm font-semibold">Cancel</button>
                    <button onClick={handleFreeze} className="flex-1 bg-error text-on-error py-2.5 rounded-xl text-sm font-bold">Yes, Freeze Now</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Contacts */}
          <h2 className="text-xl font-bold mb-4 animate-fade-in-up delay-200">Emergency Helplines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {contacts.map((c, i) => {
              const delays = ['delay-100', 'delay-200', 'delay-300', 'delay-400', 'delay-500'];
              return (
                <div key={c.id} className={`bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/10 p-5 hover:-translate-y-1 transition-all duration-300 animate-fade-in-up ${delays[Math.min(i + 1, 4)]}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColors[c.icon] || 'bg-surface-container text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined text-2xl">{c.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-on-surface mb-1">{c.name}</h3>
                    <p className="text-xs text-on-surface-variant mb-2 leading-relaxed">{c.description}</p>
                    <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-bold hover:bg-primary/20 transition-colors">
                      <span className="material-symbols-outlined text-sm">call</span>{c.phone}
                    </a>
                  </div>
                </div>
                </div>
              );
            })}
          </div>

          {/* Fraud Reporting Guide */}
          <div className="bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 p-6 animate-fade-in-up delay-400">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">description</span>Step-by-Step Fraud Reporting Guide</h2>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Document Everything', desc: 'Screenshot messages, save call logs, note transaction IDs and timestamps.' },
                { step: '2', title: 'Contact Your Bank', desc: 'Call your bank\'s fraud helpline immediately to block cards and freeze suspicious transactions.' },
                { step: '3', title: 'Report to Cyber Crime', desc: 'Call 1930 or file online complaint at cybercrime.gov.in within 24 hours.' },
                { step: '4', title: 'File a Police FIR', desc: 'Visit your nearest police station with all evidence to file a First Information Report.' },
                { step: '5', title: 'Follow Up', desc: 'Track your complaint status and follow up with both bank and police regularly.' },
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold flex-shrink-0">{s.step}</div>
                  <div><h4 className="text-sm font-bold text-on-surface mb-0.5">{s.title}</h4><p className="text-xs text-on-surface-variant">{s.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <FAB />
    </div>
  );
}
