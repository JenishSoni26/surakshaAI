'use client';
import { getRiskTier } from '@/lib/riskStyles';

export default function RiskResultCard({ riskScore, status, threatType, aiExplanation, metrics }) {
  const tier = getRiskTier(riskScore);
  return (
    <div className="space-y-4 animate-fade-in">
      <div className={`${tier.bg} rounded-2xl p-5 text-center`}>
        <div className={`text-4xl font-bold mb-1 ${tier.text}`}>{riskScore}/100</div>
        <div className={`text-sm font-semibold ${tier.text}`}>{tier.label}</div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-on-surface-variant">Status:</span>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${tier.badge}`}>{status?.toUpperCase()}</span>
      </div>
      {threatType && (
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-on-surface-variant">Threat:</span>
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
        <div className="text-xs font-semibold text-primary mb-2 flex items-center gap-1"><span className="material-symbols-outlined text-sm">smart_toy</span>AI Analysis</div>
        <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">{aiExplanation}</p>
      </div>
    </div>
  );
}
