'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import FAB from '@/components/FAB';
import Link from 'next/link';
import Script from 'next/script';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartReady, setChartReady] = useState(false);
  const trendRef = useRef(null);
  const pieRef = useRef(null);
  const barRef = useRef(null);
  const chartsRendered = useRef(false);

  const sideLinks = [
    { icon: 'dashboard', label: t('nav.dashboard'), href: '/dashboard', active: true },
    { icon: 'security', label: t('dash.recentLogs'), href: '/dashboard#security-logs' },
    { icon: 'shield', label: t('nav.upiGuardian'), href: '/upi-guardian' },
    { icon: 'school', label: t('nav.learn'), href: '/learn' },
  ];

  useEffect(() => {
    Promise.all([api.getStats(), api.getLogs(), api.getCharts()])
      .then(([s, l, c]) => { setStats(s); setLogs(l.logs); setCharts(c); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const renderCharts = useCallback(() => {
    if (typeof window === 'undefined' || !window.Chart || !charts) return;
    const gridColor = 'rgba(115,118,134,0.1)';
    const textColor = '#434655';

    // Safety Trend
    if (trendRef.current) {
      const ctx = trendRef.current.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, 'rgba(37,99,235,0.2)');
      gradient.addColorStop(1, 'rgba(37,99,235,0)');
      new window.Chart(ctx, {
        type: 'line', data: { labels: charts.safetyTrend.labels, datasets: [{ label: 'Safety Score', data: charts.safetyTrend.data, borderColor: '#2563eb', backgroundColor: gradient, borderWidth: 3, pointBackgroundColor: '#fff', pointBorderColor: '#2563eb', pointBorderWidth: 2, pointRadius: 4, fill: true, tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: 60, max: 100, grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Inter' } } }, x: { grid: { display: false }, ticks: { color: textColor, font: { family: 'Inter' } } } } }
      });
    }
    // Threat Distribution
    if (pieRef.current) {
      new window.Chart(pieRef.current.getContext('2d'), {
        type: 'doughnut', data: { labels: charts.threatDistribution.labels, datasets: [{ data: charts.threatDistribution.data, backgroundColor: ['#2563eb', '#ba1a1a', '#bc4800', '#505f76', '#943700'], borderWidth: 0, hoverOffset: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { color: textColor, font: { family: 'Inter', size: 11 }, usePointStyle: true, padding: 16 } } } }
      });
    }
    // Weekly Volume
    if (barRef.current) {
      new window.Chart(barRef.current.getContext('2d'), {
        type: 'bar', data: { labels: charts.weeklyVolume.labels, datasets: [{ label: 'Automated', data: charts.weeklyVolume.automated, backgroundColor: '#dbe1ff', borderRadius: 6, barPercentage: 0.6 }, { label: 'Manual', data: charts.weeklyVolume.manual, backgroundColor: '#2563eb', borderRadius: 6, barPercentage: 0.6 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', align: 'end', labels: { color: textColor, font: { family: 'Inter', size: 11 }, usePointStyle: true } } }, scales: { y: { stacked: true, grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Inter' } } }, x: { stacked: true, grid: { display: false }, ticks: { color: textColor, font: { family: 'Inter' } } } } }
      });
    }
  }, [charts]);

  useEffect(() => {
    const isChartReady = chartReady || (typeof window !== 'undefined' && !!window.Chart);
    if (isChartReady && charts && !chartsRendered.current) {
      chartsRendered.current = true;
      renderCharts();
    }
  }, [chartReady, charts, renderCharts]);

  const statusBadge = (status) => {
    const map = { blocked: 'bg-error-container text-on-error-container', flagged: 'bg-tertiary-container text-on-tertiary-container', verified: 'bg-primary-container/20 text-primary', safe: 'bg-success/10 text-success' };
    return map[status] || 'bg-surface-container text-on-surface-variant';
  };

  const statusLabel = (status) => {
    if (status === 'blocked') return t('label.blocked');
    if (status === 'flagged') return t('label.flagged');
    if (status === 'verified') return t('label.verified');
    return t('risk.safe');
  };

  const typeIcon = (type) => {
    const map = { sms: 'sms', email: 'email', upi: 'payments', qr: 'qr_code_2', voice: 'mic', link: 'link' };
    return map[type] || 'article';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
    </div>
  );

  return (
    <ProtectedRoute>
    <>
      <Script src="https://cdn.jsdelivr.net/npm/chart.js" onLoad={() => setChartReady(true)} onReady={() => setChartReady(true)} />
      <div className="bg-background text-on-background min-h-screen flex">
        {/* Sidebar */}
        <nav className="bg-surface-container h-screen w-64 fixed left-0 top-0 shadow-lg hidden md:flex flex-col gap-1 p-4 z-40">
          <div className="mb-8 px-2 pt-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
              <span className="material-symbols-outlined icon-fill">shield_person</span>
            </div>
            <div>
              <h2 className="font-bold text-primary text-lg">{t('dash.title')}</h2>
              <p className="text-[10px] text-on-surface-variant">SurakshaAI Monitor</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-1">
            {sideLinks.map((l, i) => (
              <Link key={i} href={l.href} className={`rounded-xl flex items-center gap-3 p-3 transition-all text-sm ${l.active ? 'bg-primary-container text-on-primary-container font-semibold' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
                <span className="material-symbols-outlined text-xl">{l.icon}</span>{l.label}
              </Link>
            ))}
            <div className="mt-auto">
              <Link href="/profile" className="rounded-xl flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-variant transition-all text-sm">
                <span className="material-symbols-outlined text-xl">settings</span>{t('nav.profile')}
              </Link>
            </div>
          </div>
          <Link href="/scam-analyzer" className="mt-4 w-full bg-primary-container text-on-primary-container rounded-xl py-2.5 px-4 text-sm font-bold shadow hover:bg-primary transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined icon-fill text-lg">radar</span>{t('scam.analyzeBtn')}
          </Link>
        </nav>

        {/* Main Content */}
        <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 pt-20 p-4 md:p-6 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="mb-8 pt-4">
              <h1 className="text-2xl md:text-3xl font-bold">{t('dash.title')}</h1>
              <p className="text-on-surface-variant mt-1 text-sm">{t('dash.subtitle')}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-surface-container-lowest rounded-xl p-5 shadow-xl hover:-translate-y-1 transition-transform border border-outline-variant/10">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-11 h-11 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                    <span className="material-symbols-outlined">plagiarism</span>
                  </div>
                </div>
                <p className="text-xs font-semibold text-on-surface-variant mb-1">{t('dash.totalScans')}</p>
                <h3 className="text-3xl font-bold">{stats?.totalScans?.toLocaleString() || '0'}</h3>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-5 shadow-xl hover:-translate-y-1 transition-transform border border-outline-variant/10">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-11 h-11 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
                    <span className="material-symbols-outlined">gpp_bad</span>
                  </div>
                </div>
                <p className="text-xs font-semibold text-on-surface-variant mb-1">{t('dash.threatsBlocked')}</p>
                <h3 className="text-3xl font-bold">{stats?.scamsPrevented || '0'}</h3>
              </div>
              <div className="glass-card rounded-xl p-5 shadow-xl hover:-translate-y-1 transition-transform relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
                <div className="flex justify-between items-start mb-3 relative z-10">
                  <div className="w-11 h-11 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined icon-fill">health_and_safety</span>
                  </div>
                </div>
                <p className="text-xs font-semibold text-on-surface-variant mb-1 relative z-10">{t('dash.riskScore')}</p>
                <h3 className="text-3xl font-bold text-primary relative z-10">{stats?.safetyScore || 0}/100</h3>
                <div className="w-full bg-surface-variant h-2 rounded-full mt-2 overflow-hidden relative z-10">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${stats?.safetyScore || 0}%` }} />
                </div>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-5 shadow-xl hover:-translate-y-1 transition-transform border border-outline-variant/10">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-11 h-11 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
                    <span className="material-symbols-outlined">verified</span>
                  </div>
                </div>
                <p className="text-xs font-semibold text-on-surface-variant mb-1">{t('dash.safeTxns')}</p>
                <h3 className="text-3xl font-bold">{stats?.safeScans || logs.filter(l => l.status === 'safe' || l.status === 'verified').length || '0'}</h3>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
              <div className="bg-surface-container-lowest rounded-xl p-5 shadow-xl border border-outline-variant/10 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-3">{t('dash.riskScore')}</h3>
                <div className="h-64 w-full relative"><canvas ref={trendRef}></canvas></div>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-5 shadow-xl border border-outline-variant/10">
                <h3 className="text-lg font-semibold mb-3">{t('dash.threatDistribution')}</h3>
                <div className="h-64 w-full relative flex justify-center"><canvas ref={pieRef}></canvas></div>
              </div>
            </div>

            {/* Security Logs */}
            <div id="security-logs" className="bg-surface-container-lowest rounded-xl p-5 shadow-xl border border-outline-variant/10 mb-8 overflow-hidden scroll-mt-24">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{t('dash.recentLogs')}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/20">
                      <th className="py-3 px-2 text-xs font-semibold text-on-surface-variant">{t('dash.timestamp')}</th>
                      <th className="py-3 px-2 text-xs font-semibold text-on-surface-variant">{t('dash.scanType')}</th>
                      <th className="py-3 px-2 text-xs font-semibold text-on-surface-variant">{t('label.riskLevel')}</th>
                      <th className="py-3 px-2 text-xs font-semibold text-on-surface-variant">{t('label.status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-sm text-on-surface-variant">{t('dash.noLogs')}</td>
                      </tr>
                    ) : (
                      logs.map((log, i) => (
                        <tr key={i} className="hover:bg-surface-container-low transition-colors">
                          <td className="py-3 px-2 text-sm">{new Date(log.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                          <td className="py-3 px-2">
                            <span className="flex items-center gap-1 text-sm font-medium">
                              <span className="material-symbols-outlined text-sm">{typeIcon(log.type)}</span>
                              {log.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span className={`font-bold ${log.risk_score >= 70 ? 'text-error' : log.risk_score >= 40 ? 'text-tertiary' : 'text-primary'}`}>
                              {log.risk_score}/100
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span className={`${statusBadge(log.status)} px-2.5 py-0.5 rounded-full text-[10px] font-bold`}>
                              {statusLabel(log.status)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
        <FAB />
      </div>
    </>
    </ProtectedRoute>
  );
}
