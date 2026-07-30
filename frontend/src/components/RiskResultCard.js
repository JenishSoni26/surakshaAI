'use client';
import { getRiskTier } from '@/lib/riskStyles';
import { useLanguage } from '@/lib/i18n';

export default function RiskResultCard({ riskScore, status, threatType, aiExplanation, metrics }) {
  const tier = getRiskTier(riskScore);
  const { t } = useLanguage();

  const levelLabel = t(tier.labelKey) || tier.fallbackLabel;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Risk Level Badge — replaces numeric score */}
      <div className={`${tier.bg} rounded-2xl p-6 text-center`}>
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${tier.badgeAccent} mb-3`}>
          <span className={`material-symbols-outlined text-3xl icon-fill`}>{tier.icon}</span>
        </div>
        <div className={`text-2xl font-bold mb-1 ${tier.text} uppercase tracking-wide`}>{levelLabel}</div>
        <div className={`text-xs font-medium ${tier.text} opacity-70`}>{t('label.riskLevel')}</div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-on-surface-variant">{t('label.status')}:</span>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${tier.badge}`}>{status?.toUpperCase()}</span>
      </div>
      {threatType && (
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-on-surface-variant">{t('label.threat')}:</span>
          <span className="text-sm font-semibold text-on-surface">{threatType}</span>
        </div>
      )}
      {metrics && metrics.length > 0 && (
        <div className="space-y-2">
          {metrics.map((m, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs"><span className="text-on-surface-variant">{m.label}</span><span className="font-bold">{m.value}</span></div>
              <div className="w-full bg-surface-container-high h-2 rounded-full"><div className={`h-full rounded-full ${tier.bar}`} style={{ width: `${Math.min(Math.max(m.percent, 0), 100)}%` }}></div></div>
            </div>
          ))}
        </div>
      )}
      <div className="bg-surface-container rounded-2xl p-4 border-l-4 border-primary">
        <div className="text-xs font-semibold text-primary mb-2 flex items-center gap-1"><span className="material-symbols-outlined text-sm">smart_toy</span>{t('label.aiAnalysis')}</div>
        <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">{aiExplanation}</p>
      </div>
    </div>
  );
}
