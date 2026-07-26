'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('demo@surakshapay.ai');
  const [password, setPassword] = useState('demo1234');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let data;
      if (isRegister) {
        data = await api.register(name, email, password, phone);
      } else {
        data = await api.login(email, password);
      }
      login(data.user, data.token);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 flex items-center justify-center px-4">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-primary-container mx-auto flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-on-primary-container icon-fill">shield_person</span>
              </div>
              <h1 className="text-2xl font-bold text-on-surface">{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
              <p className="text-sm text-on-surface-variant mt-2">{isRegister ? 'Join SurakshaPayAI for financial safety' : 'Sign in to your security dashboard'}</p>
            </div>

            {error && (
              <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">error</span>{error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant block mb-1">Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required
                    className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Rahul Sharma" />
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-on-surface-variant block mb-1">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="you@example.com" />
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface-variant block mb-1">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                  className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="••••••••" />
              </div>
              {isRegister && (
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant block mb-1">Phone (optional)</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="+91 98765 43210" />
                </div>
              )}
              <button type="submit" disabled={loading}
                className="w-full bg-primary text-on-primary py-3 rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>}
                {isRegister ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button onClick={() => { setIsRegister(!isRegister); setError(''); }}
                className="text-sm text-primary font-semibold hover:underline">
                {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
              </button>
            </div>

            {!isRegister && (
              <div className="mt-4 bg-surface-container rounded-xl p-3 text-center">
                <p className="text-xs text-on-surface-variant">Demo: <span className="font-semibold">demo@surakshapay.ai</span> / <span className="font-semibold">demo1234</span></p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
