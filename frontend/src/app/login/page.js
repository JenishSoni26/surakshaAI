'use client';
import { useState, useEffect, Suspense } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleLogin } from '@react-oauth/google';

/* ── tiny SVG Google logo ── */
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h13.1c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.3 7.4-10.6 7.4-17.5z" fill="#4285F4"/>
      <path d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-6c-2.1 1.4-4.8 2.3-8 2.3-6.1 0-11.3-4.1-13.2-9.7H2.6v6.2C6.6 42.7 14.7 48 24 48z" fill="#34A853"/>
      <path d="M10.8 28.8c-.5-1.4-.7-2.9-.7-4.8s.3-3.4.7-4.8v-6.2H2.6C.9 16.8 0 20.3 0 24s.9 7.2 2.6 10.2l8.2-5.4z" fill="#FBBC05"/>
      <path d="M24 9.5c3.4 0 6.5 1.2 8.9 3.5l6.7-6.7C35.9 2.4 30.4 0 24 0 14.7 0 6.6 5.3 2.6 13.8l8.2 6.2c1.9-5.6 7.1-10.5 13.2-10.5z" fill="#EA4335"/>
    </svg>
  );
}

/* ── floating orb background ── */
function AuthBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* deep gradient backdrop */}
      <div style={{
        position:'absolute', inset:0,
        background:'linear-gradient(135deg,#0a0f2e 0%,#0d1b4b 40%,#0a0f2e 100%)'
      }}/>
      {/* glow orbs */}
      <div style={{
        position:'absolute', top:'-10%', left:'-5%',
        width:'55vw', height:'55vw', borderRadius:'50%',
        background:'radial-gradient(circle, rgba(37,99,235,0.35) 0%, transparent 70%)',
        filter:'blur(60px)', animation:'floatOrb1 8s ease-in-out infinite'
      }}/>
      <div style={{
        position:'absolute', bottom:'-15%', right:'-10%',
        width:'60vw', height:'60vw', borderRadius:'50%',
        background:'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
        filter:'blur(80px)', animation:'floatOrb2 10s ease-in-out infinite'
      }}/>
      <div style={{
        position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
        width:'40vw', height:'40vw', borderRadius:'50%',
        background:'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
        filter:'blur(60px)'
      }}/>
      {/* grid overlay */}
      <div style={{
        position:'absolute', inset:0,
        backgroundImage:'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize:'40px 40px'
      }}/>
      <style>{`
        @keyframes floatOrb1 {
          0%,100%{transform:translateY(0) scale(1);}
          50%{transform:translateY(-30px) scale(1.05);}
        }
        @keyframes floatOrb2 {
          0%,100%{transform:translateY(0) scale(1);}
          50%{transform:translateY(25px) scale(0.97);}
        }
        @keyframes shimmer {
          0%{opacity:0.5;} 50%{opacity:1;} 100%{opacity:0.5;}
        }
        @keyframes authSlideIn {
          from{opacity:0;transform:translateY(28px);}
          to{opacity:1;transform:translateY(0);}
        }
        @keyframes tabSlide {
          from{opacity:0;transform:translateX(12px);}
          to{opacity:1;transform:translateX(0);}
        }
        .auth-card { animation: authSlideIn 0.65s cubic-bezier(.22,1,.36,1) forwards; }
        .tab-content { animation: tabSlide 0.35s ease-out forwards; }
        .google-btn:hover { transform:translateY(-1px); box-shadow:0 8px 32px rgba(37,99,235,0.25); }
        .google-btn:active { transform:translateY(0); }
        .auth-input:focus { border-color:rgba(99,102,241,0.8); box-shadow:0 0 0 3px rgba(99,102,241,0.15); }
        .submit-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 32px rgba(37,99,235,0.45); }
        .submit-btn:active:not(:disabled) { transform:translateY(0); }
        .feature-item { animation:authSlideIn 0.6s ease-out both; }
        .feature-item:nth-child(1){animation-delay:.1s;}
        .feature-item:nth-child(2){animation-delay:.2s;}
        .feature-item:nth-child(3){animation-delay:.3s;}
        .feature-item:nth-child(4){animation-delay:.4s;}
      `}</style>
    </div>
  );
}

function LoginContent() {

  const [tab, setTab] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect already-authenticated users to dashboard (or original destination)
  useEffect(() => {
    if (isAuthenticated) {
      const from = searchParams.get('from') || '/dashboard';
      router.replace(from);
    }
  }, [isAuthenticated, router, searchParams]);

  const hasGoogleClientId = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  function switchTab(t) {
    setTab(t);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      let data;
      if (tab === 'signup') {
        data = await api.register(name, email, password, phone);
        setSuccess('Account created! Redirecting…');
      } else {
        data = await api.login(email, password);
      }
      login(data.user, data.token);
      const dest = searchParams.get('from') || '/dashboard';
      setTimeout(() => router.push(dest), 600);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // (Google credential handled by GoogleLogin component below)

  async function handleGoogleCredential(credentialResponse) {
    setError('');
    setLoading(true);
    try {
      const data = await api.googleAuth(credentialResponse.credential);
      login(data.user, data.token);
      const dest = searchParams.get('from') || '/dashboard';
      setTimeout(() => router.push(dest), 600);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const features = [
    { icon: 'shield_lock', label: 'AI Scam Detection', desc: 'Real-time threat analysis' },
    { icon: 'qr_code_scanner', label: 'QR & UPI Guard', desc: 'Verify before you pay' },
    { icon: 'school', label: 'Fraud Education', desc: 'Learn to stay safe' },
    { icon: 'emergency', label: 'Emergency Tools', desc: 'Instant fraud reporting' },
  ];

  return (
    <>
      <AuthBackground />
      <div style={{ position:'relative', zIndex:10, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 16px' }}>
        <div style={{ width:'100%', maxWidth:'1000px', display:'grid', gridTemplateColumns:'1fr', gap:'0' }} className="lg:grid-cols-2-auth">
          
          {/* ── Left Branding Panel (hidden on small screens) ── */}
          <div style={{ display:'none' }} className="auth-left-panel">
            <div style={{
              height:'100%', padding:'48px 40px', display:'flex', flexDirection:'column', justifyContent:'center', gap:'40px'
            }}>
              {/* Logo */}
              <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                <div style={{
                  width:'52px', height:'52px', borderRadius:'16px',
                  background:'linear-gradient(135deg,#2563eb,#7c3aed)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:'0 8px 24px rgba(37,99,235,0.4)'
                }}>
                  <span className="material-symbols-outlined icon-fill" style={{ color:'white', fontSize:'28px' }}>shield</span>
                </div>
                <div>
                  <div style={{ fontWeight:800, fontSize:'22px', color:'white', letterSpacing:'-0.5px' }}>SurakshaAI</div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', fontWeight:500 }}>Financial Security Platform</div>
                </div>
              </div>

              {/* Headline */}
              <div>
                <h1 style={{ fontSize:'36px', fontWeight:800, color:'white', lineHeight:1.2, letterSpacing:'-1px', marginBottom:'16px' }}>
                  Protect your money<br/>
                  <span style={{ background:'linear-gradient(90deg,#60a5fa,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                    with AI-powered
                  </span><br/>
                  security
                </h1>
                <p style={{ color:'rgba(255,255,255,0.55)', fontSize:'15px', lineHeight:1.7, maxWidth:'340px' }}>
                  Join thousands of Indians who use SurakshaAI to detect scams, verify payments, and stay safe online.
                </p>
              </div>

              {/* Feature list */}
              <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                {features.map((f) => (
                  <div key={f.icon} className="feature-item" style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                    <div style={{
                      width:'44px', height:'44px', borderRadius:'12px', flexShrink:0,
                      background:'rgba(255,255,255,0.08)', backdropFilter:'blur(8px)',
                      border:'1px solid rgba(255,255,255,0.12)',
                      display:'flex', alignItems:'center', justifyContent:'center'
                    }}>
                      <span className="material-symbols-outlined icon-fill" style={{ color:'#60a5fa', fontSize:'22px' }}>{f.icon}</span>
                    </div>
                    <div>
                      <div style={{ color:'white', fontWeight:600, fontSize:'14px' }}>{f.label}</div>
                      <div style={{ color:'rgba(255,255,255,0.45)', fontSize:'12px' }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Trust badge */}
              <div style={{
                padding:'16px 20px', borderRadius:'16px',
                background:'rgba(255,255,255,0.05)', backdropFilter:'blur(8px)',
                border:'1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
                  <span className="material-symbols-outlined icon-fill" style={{ color:'#34d399', fontSize:'18px' }}>verified</span>
                  <span style={{ color:'white', fontWeight:600, fontSize:'13px' }}>Trusted & Secure</span>
                </div>
                <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'12px', margin:0 }}>
                  Your data is encrypted and never shared. Free forever for personal use.
                </p>
              </div>
            </div>
          </div>

          {/* ── Right Form Panel ── */}
          <div className="auth-card" style={{
            background:'rgba(255,255,255,0.06)',
            backdropFilter:'blur(24px)',
            WebkitBackdropFilter:'blur(24px)',
            border:'1px solid rgba(255,255,255,0.12)',
            borderRadius:'28px',
            padding:'clamp(28px,5vw,48px)',
            boxShadow:'0 32px 80px rgba(0,0,0,0.4)',
            width:'100%', maxWidth:'460px', margin:'0 auto'
          }}>
            
            {/* Logo (mobile) */}
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'32px' }}>
              <div style={{
                width:'40px', height:'40px', borderRadius:'12px',
                background:'linear-gradient(135deg,#2563eb,#7c3aed)',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 4px 16px rgba(37,99,235,0.4)'
              }}>
                <span className="material-symbols-outlined icon-fill" style={{ color:'white', fontSize:'22px' }}>shield</span>
              </div>
              <span style={{ fontWeight:800, fontSize:'18px', color:'white' }}>SurakshaAI</span>
            </div>

            {/* Tab switcher */}
            <div style={{
              display:'flex', gap:'4px', padding:'4px',
              background:'rgba(255,255,255,0.07)', borderRadius:'14px',
              marginBottom:'32px', position:'relative'
            }}>
              {['login','signup'].map((t) => (
                <button
                  key={t}
                  onClick={() => switchTab(t)}
                  id={`auth-tab-${t}`}
                  style={{
                    flex:1, padding:'10px', borderRadius:'10px', border:'none', cursor:'pointer',
                    fontSize:'14px', fontWeight:600, transition:'all 0.25s ease',
                    background: tab === t ? 'linear-gradient(135deg,#2563eb,#7c3aed)' : 'transparent',
                    color: tab === t ? 'white' : 'rgba(255,255,255,0.5)',
                    boxShadow: tab === t ? '0 4px 16px rgba(37,99,235,0.35)' : 'none',
                  }}
                >
                  {t === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            {/* Heading */}
            <div style={{ marginBottom:'24px' }}>
              <h2 style={{ fontSize:'24px', fontWeight:800, color:'white', marginBottom:'6px', letterSpacing:'-0.5px' }}>
                {tab === 'login' ? 'Welcome back 👋' : 'Get started free 🚀'}
              </h2>
              <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'14px', margin:0 }}>
                {tab === 'login' ? 'Sign in to your security dashboard' : 'Create your account in seconds'}
              </p>
            </div>

            {/* Error / Success */}
            {error && (
              <div style={{
                display:'flex', alignItems:'center', gap:'10px',
                padding:'12px 16px', borderRadius:'12px', marginBottom:'20px',
                background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)',
                color:'#fca5a5', fontSize:'13px', fontWeight:500
              }}>
                <span className="material-symbols-outlined" style={{ fontSize:'18px', flexShrink:0 }}>error</span>
                {error}
              </div>
            )}
            {success && (
              <div style={{
                display:'flex', alignItems:'center', gap:'10px',
                padding:'12px 16px', borderRadius:'12px', marginBottom:'20px',
                background:'rgba(52,211,153,0.15)', border:'1px solid rgba(52,211,153,0.3)',
                color:'#6ee7b7', fontSize:'13px', fontWeight:500
              }}>
                <span className="material-symbols-outlined icon-fill" style={{ fontSize:'18px', flexShrink:0 }}>check_circle</span>
                {success}
              </div>
            )}

            {/* Google Button */}
            {hasGoogleClientId ? (
              <div style={{ marginBottom:'20px' }}>
                <GoogleSignInButton onCredential={handleGoogleCredential} loading={loading} />
              </div>
            ) : (
              <div style={{
                padding:'12px 16px', borderRadius:'12px', marginBottom:'20px',
                background:'rgba(255,255,255,0.05)', border:'1px dashed rgba(255,255,255,0.15)',
                display:'flex', alignItems:'center', gap:'10px'
              }}>
                <GoogleIcon />
                <span style={{ color:'rgba(255,255,255,0.4)', fontSize:'13px' }}>
                  Google Sign-In not configured — add <code style={{ fontSize:'11px', background:'rgba(255,255,255,0.1)', padding:'2px 6px', borderRadius:'4px' }}>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> to enable
                </span>
              </div>
            )}

            {/* Divider */}
            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px' }}>
              <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.1)' }}/>
              <span style={{ color:'rgba(255,255,255,0.3)', fontSize:'12px', fontWeight:500, whiteSpace:'nowrap' }}>or continue with email</span>
              <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.1)' }}/>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="tab-content" style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              {tab === 'signup' && (
                <InputField id="auth-name" label="Full Name" type="text" value={name}
                  onChange={e => setName(e.target.value)} placeholder="Rahul Sharma" required />
              )}
              <InputField id="auth-email" label="Email Address" type="email" value={email}
                onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
              <div>
                <label htmlFor="auth-password" style={{ display:'block', fontSize:'12px', fontWeight:600, color:'rgba(255,255,255,0.6)', marginBottom:'6px', letterSpacing:'0.3px' }}>Password</label>
                <div style={{ position:'relative' }}>
                  <input
                    id="auth-password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="auth-input"
                    style={{
                      width:'100%', boxSizing:'border-box',
                      padding:'12px 44px 12px 16px', borderRadius:'12px',
                      background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)',
                      color:'white', fontSize:'14px', outline:'none', transition:'all 0.2s',
                    }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:'4px', color:'rgba(255,255,255,0.4)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize:'18px' }}>{showPass ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
              {tab === 'signup' && (
                <InputField id="auth-phone" label="Phone (optional)" type="tel" value={phone}
                  onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" />
              )}

              <button
                type="submit"
                id="auth-submit-btn"
                disabled={loading}
                className="submit-btn"
                style={{
                  width:'100%', padding:'13px', borderRadius:'12px', border:'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  background: loading ? 'rgba(37,99,235,0.5)' : 'linear-gradient(135deg,#2563eb 0%,#7c3aed 100%)',
                  color:'white', fontSize:'15px', fontWeight:700,
                  display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                  transition:'all 0.2s ease', letterSpacing:'-0.2px',
                  boxShadow:'0 4px 20px rgba(37,99,235,0.3)',
                  marginTop:'4px'
                }}
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin" style={{ fontSize:'18px' }}>progress_activity</span>
                    {tab === 'signup' ? 'Creating Account…' : 'Signing In…'}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined icon-fill" style={{ fontSize:'18px' }}>
                      {tab === 'signup' ? 'person_add' : 'login'}
                    </span>
                    {tab === 'signup' ? 'Create Account' : 'Sign In'}
                  </>
                )}
              </button>
            </form>

            {/* Switch tab link */}
            <p style={{ textAlign:'center', marginTop:'20px', color:'rgba(255,255,255,0.4)', fontSize:'14px' }}>
              {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => switchTab(tab === 'login' ? 'signup' : 'login')}
                style={{ background:'none', border:'none', cursor:'pointer', color:'#60a5fa', fontWeight:600, fontSize:'14px', padding:0 }}
              >
                {tab === 'login' ? 'Sign up free' : 'Sign in'}
              </button>
            </p>

            {/* Demo hint */}
            {tab === 'login' && (
              <div style={{
                marginTop:'16px', padding:'12px 16px', borderRadius:'12px',
                background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)',
                display:'flex', alignItems:'center', gap:'10px'
              }}>
                <span className="material-symbols-outlined icon-fill" style={{ color:'#fbbf24', fontSize:'18px', flexShrink:0 }}>info</span>
                <p style={{ margin:0, fontSize:'12px', color:'rgba(255,255,255,0.4)' }}>
                  Demo: <span style={{ color:'rgba(255,255,255,0.7)', fontWeight:600 }}>demo@surakshapay.ai</span>
                  {' / '}
                  <span style={{ color:'rgba(255,255,255,0.7)', fontWeight:600 }}>demo1234</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (min-width: 800px) {
          .lg\\:grid-cols-2-auth {
            grid-template-columns: 1fr 1fr !important;
            max-width: 1000px !important;
          }
          .auth-left-panel {
            display: block !important;
          }
        }
        input::placeholder { color: rgba(255,255,255,0.25) !important; }
        input { color-scheme: dark; }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
      `}</style>
    </>
  );
}

/* ── Reusable input component ── */
function InputField({ id, label, type, value, onChange, placeholder, required }) {
  return (
    <div>
      <label htmlFor={id} style={{ display:'block', fontSize:'12px', fontWeight:600, color:'rgba(255,255,255,0.6)', marginBottom:'6px', letterSpacing:'0.3px' }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="auth-input"
        style={{
          width:'100%', boxSizing:'border-box',
          padding:'12px 16px', borderRadius:'12px',
          background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)',
          color:'white', fontSize:'14px', outline:'none', transition:'all 0.2s',
        }}
      />
    </div>
  );
}

/* ── Google Sign-In Button using GoogleLogin component ── */
function GoogleSignInButton({ onCredential }) {
  return (
    <div style={{ width:'100%' }}>
      <div style={{ display:'flex', justifyContent:'center' }}>
        <GoogleLogin
          onSuccess={onCredential}
          onError={() => {}}
          theme="filled_black"
          size="large"
          shape="rectangular"
          width="400"
          text="continue_with"
          logo_alignment="left"
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0f2e]" />}>
      <LoginContent />
    </Suspense>
  );
}

