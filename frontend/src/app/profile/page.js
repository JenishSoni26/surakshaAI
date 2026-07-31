'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';
import ProtectedRoute from '@/components/ProtectedRoute';

function Toggle({ value, onChange, label }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-on-surface font-medium">{label}</span>
      <button
        onClick={() => onChange(!value)}
        type="button"
        className={`w-11 h-6 rounded-full transition-colors relative ${value ? 'bg-primary' : 'bg-outline-variant'}`}
      >
        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow ${value ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const { t, lang } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(() => !!isAuthenticated);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [twoFactor, setTwoFactor] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      api.getProfile().then(d => {
        setProfile(d.user);
        setName(d.user.name || '');
        setPhone(d.user.phone || '');
        setTwoFactor(!!d.user.two_factor_enabled);
        setLoginAlerts(!!d.user.login_alerts);
        setEmailNotif(!!d.user.email_notifications);
        setSmsNotif(!!d.user.sms_notifications);
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [isAuthenticated]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const data = await api.updateProfile({
        name,
        phone,
        two_factor_enabled: twoFactor,
        login_alerts: loginAlerts,
        email_notifications: emailNotif,
        sms_notifications: smsNotif
      });
      setProfile(data.user);
      setMessage(data.message || (lang === 'hi' ? 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!' : lang === 'gu' ? 'પ્રોફાઇલ સફળતાપૂર્વક અપડેટ થઈ!' : 'Profile updated successfully!'));
      setTimeout(() => setMessage(''), 3500);
    } catch (err) {
      setMessage(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-24 pb-12 flex items-center justify-center">
          <div className="text-center p-6 bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-xl max-w-sm">
            <span className="material-symbols-outlined text-5xl text-primary mb-4 block">lock</span>
            <h1 className="text-xl font-bold mb-2 text-on-surface">Access Protected</h1>
            <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">Sign in to your SurakshaAI account to manage your profile and security settings.</p>
            <a href="/login" className="w-full bg-primary text-on-primary py-3 rounded-xl text-sm font-bold block hover:opacity-90 transition-opacity">Go to Login</a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-24 pb-12">
          <div className="max-w-2xl mx-auto px-4">
            <div className="text-center mb-8 animate-fade-in-up">
              <div className="w-20 h-20 rounded-full bg-primary-container mx-auto flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-4xl text-on-primary-container icon-fill">person</span>
              </div>
              <h1 className="text-2xl font-bold text-on-surface">{profile?.name || user?.name || 'User'}</h1>
              <p className="text-sm text-on-surface-variant">{profile?.email || user?.email}</p>
            </div>

            {message && (
              <div className={`mb-6 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in ${message.toLowerCase().includes('success') || message.includes('સફળતાપૂર્વક') || message.includes('सफलतापूर्वक') ? 'bg-success/10 text-success border border-success/20' : 'bg-error-container/30 text-error border border-error/20'}`}>
                <span className="material-symbols-outlined text-lg">{message.toLowerCase().includes('success') || message.includes('સફળતાપૂર્વક') || message.includes('सफलतापूर्वक') ? 'check_circle' : 'error'}</span>
                {message}
              </div>
            )}

            {/* Profile Info */}
            <div className="bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 p-6 mb-6 animate-fade-in-up delay-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary">badge</span>
                {t('prof.personalInfo')}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant block mb-1">{t('prof.name')}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant block mb-1">{t('prof.email')}</label>
                  <input
                    type="email"
                    value={profile?.email || user?.email || ''}
                    disabled
                    className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm border border-outline-variant/20 text-on-surface-variant opacity-70 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant block mb-1">{t('prof.phone')}</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 p-6 mb-6 animate-fade-in-up delay-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary">security</span>
                {t('prof.securitySettings')}
              </h2>
              <div className="divide-y divide-outline-variant/10">
                <Toggle label={t('prof.2fa')} value={twoFactor} onChange={setTwoFactor} />
                <Toggle label={t('prof.loginAlerts')} value={loginAlerts} onChange={setLoginAlerts} />
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 p-6 mb-6 animate-fade-in-up delay-300">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary">notifications</span>
                {t('prof.emailNotifs')}
              </h2>
              <div className="divide-y divide-outline-variant/10">
                <Toggle label={t('prof.emailNotifs')} value={emailNotif} onChange={setEmailNotif} />
                <Toggle label={t('prof.smsNotifs')} value={smsNotif} onChange={setSmsNotif} />
              </div>
            </div>

            {/* Save & Logout Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-primary text-on-primary py-3 rounded-full text-sm font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <><span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>{t('label.analyzing')}</>
                ) : (
                  <><span className="material-symbols-outlined text-lg">save</span>{t('prof.updateBtn')}</>
                )}
              </button>

              <button
                onClick={handleLogout}
                className="px-6 py-3 rounded-full text-sm font-bold bg-error-container/30 text-error hover:bg-error-container/60 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                {lang === 'hi' ? 'लॉग आउट' : lang === 'gu' ? 'લૉગ આઉટ' : 'Log Out'}
              </button>
            </div>
          </div>
        </main>
        <Footer />
        <FAB />
      </div>
    </ProtectedRoute>
  );
}
