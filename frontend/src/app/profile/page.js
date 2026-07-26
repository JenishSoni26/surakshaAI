'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
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
        setName(d.user.name);
        setPhone(d.user.phone || '');
        setTwoFactor(!!d.user.two_factor_enabled);
        setLoginAlerts(!!d.user.login_alerts);
        setEmailNotif(!!d.user.email_notifications);
        setSmsNotif(!!d.user.sms_notifications);
      }).catch(console.error).finally(() => setLoading(false));
    } else { setLoading(false); }
  }, [isAuthenticated]);

  const handleSave = async () => {
    setSaving(true); setMessage('');
    try {
      await api.updateProfile({ name, phone, two_factor_enabled: twoFactor, login_alerts: loginAlerts, email_notifications: emailNotif, sms_notifications: smsNotif });
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage(err.message); } finally { setSaving(false); }
  };

  const Toggle = ({ value, onChange, label }) => (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-on-surface">{label}</span>
      <button onClick={() => onChange(!value)} className={`w-11 h-6 rounded-full transition-colors relative ${value ? 'bg-primary' : 'bg-outline-variant'}`}>
        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow ${value ? 'translate-x-5.5' : 'translate-x-0.5'}`}></div>
      </button>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-24 pb-12 flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4 block">lock</span>
            <h1 className="text-xl font-bold mb-2">Please Log In</h1>
            <p className="text-sm text-on-surface-variant mb-4">Sign in to access your profile and settings.</p>
            <a href="/login" className="bg-primary text-on-primary px-6 py-2.5 rounded-xl text-sm font-bold inline-block">Go to Login</a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span></div>;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-primary-container mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-4xl text-on-primary-container icon-fill">person</span>
            </div>
            <h1 className="text-2xl font-bold">{profile?.name || 'User'}</h1>
            <p className="text-sm text-on-surface-variant">{profile?.email}</p>
          </div>

          {message && (
            <div className={`mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-fade-in ${message.includes('success') ? 'bg-success/10 text-success' : 'bg-error-container text-on-error-container'}`}>
              <span className="material-symbols-outlined text-lg">{message.includes('success') ? 'check_circle' : 'error'}</span>{message}
            </div>
          )}

          {/* Profile Info */}
          <div className="bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 p-6 mb-6 animate-fade-in-up delay-100">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">badge</span>Profile Information</h2>
            <div className="space-y-4">
              <div><label className="text-xs font-semibold text-on-surface-variant block mb-1">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" /></div>
              <div><label className="text-xs font-semibold text-on-surface-variant block mb-1">Email</label>
                <input type="email" value={profile?.email || ''} disabled className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm border border-outline-variant/20 text-on-surface-variant opacity-70 cursor-not-allowed" /></div>
              <div><label className="text-xs font-semibold text-on-surface-variant block mb-1">Phone</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" /></div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 p-6 mb-6 animate-fade-in-up delay-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">security</span>Security Settings</h2>
            <div className="divide-y divide-outline-variant/10">
              <Toggle label="Two-Factor Authentication" value={twoFactor} onChange={setTwoFactor} />
              <Toggle label="Login Alerts" value={loginAlerts} onChange={setLoginAlerts} />
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 p-6 mb-6 animate-fade-in-up delay-300">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">notifications</span>Notification Preferences</h2>
            <div className="divide-y divide-outline-variant/10">
              <Toggle label="Email Notifications" value={emailNotif} onChange={setEmailNotif} />
              <Toggle label="SMS Notifications" value={smsNotif} onChange={setSmsNotif} />
            </div>
          </div>

          {/* Save Button */}
          <button onClick={handleSave} disabled={saving}
            className="w-full bg-primary text-on-primary py-3 rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-6">
            {saving ? <><span className="material-symbols-outlined animate-spin">progress_activity</span>Saving...</> : <><span className="material-symbols-outlined">save</span>Save Changes</>}
          </button>

          {/* Account Info */}
          <div className="bg-surface-container rounded-2xl p-4 text-center text-xs text-on-surface-variant">
            <p>Account created: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
          </div>
        </div>
      </main>
      <Footer />
      <FAB />
    </div>
  );
}
