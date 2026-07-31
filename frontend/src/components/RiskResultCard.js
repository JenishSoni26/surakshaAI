'use client';
import { getRiskTier } from '@/lib/riskStyles';
import { useLanguage } from '@/lib/i18n';
import Link from 'next/link';

export default function RiskResultCard(props) {
  const { t, translateThreatPattern, translateModuleTitle } = useLanguage();
  const { loading, result } = props;

  // Render pulsing skeleton loading card during analysis
  if (loading) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-8 text-center shadow-lg animate-pulse space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
          <span className="material-symbols-outlined text-3xl animate-spin">progress_activity</span>
        </div>
        <div className="text-sm font-bold text-on-surface">{t('scam.analyzing')}</div>
        <div className="text-xs text-on-surface-variant">SurakshaAI Hybrid Model Engine</div>
      </div>
    );
  }

  // Extract result object
  const res = result && typeof result === 'object' && Object.keys(result).length > 0
    ? result
    : (props.riskLevel || props.riskScore || props.risk_score || props.error)
      ? props
      : null;

  if (!res) {
    return (
      <div className="bg-surface-container-lowest/50 border border-dashed border-outline-variant/30 rounded-3xl p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-surface-container text-on-surface-variant/60 flex items-center justify-center mx-auto mb-3">
          <span className="material-symbols-outlined text-3xl">radar</span>
        </div>
        <div className="text-xs font-semibold text-on-surface-variant">
          {t('qr.resultsPlaceholder')}
        </div>
      </div>
    );
  }

  if (res.error) {
    return (
      <div className="bg-error-container/20 border border-error/30 rounded-2xl p-6 text-center animate-fade-in">
        <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto mb-3">
          <span className="material-symbols-outlined text-2xl">error</span>
        </div>
        <h3 className="text-sm font-bold text-error mb-1">{t('label.analysisError')}</h3>
        <p className="text-xs text-on-surface-variant">{res.error}</p>
      </div>
    );
  }

  // Determine numerical risk score
  let score = typeof res.riskScore === 'number' ? res.riskScore : typeof res.risk_score === 'number' ? res.risk_score : 0;
  if (!score && res.riskLevel) {
    if (res.riskLevel === 'HIGH') score = 75;
    else if (res.riskLevel === 'MEDIUM') score = 50;
    else score = 10;
  }

  const tier = getRiskTier(score);
  const levelLabel = t(tier.labelKey) || tier.fallbackLabel;

  // Status localization
  const rawStatus = res.status || (res.riskLevel === 'HIGH' ? 'blocked' : res.riskLevel === 'MEDIUM' ? 'flagged' : 'safe');
  let statusText = t('risk.safe');
  if (rawStatus === 'blocked') statusText = t('label.blocked');
  else if (rawStatus === 'flagged') statusText = t('label.flagged');
  else if (rawStatus === 'verified') statusText = t('label.verified');

  // Threat & Pattern Localization
  const rawThreatType = res.threatType || res.threat_type || (res.detectedPatterns && res.detectedPatterns[0]) || '';
  const threatTypeTranslated = translateThreatPattern(rawThreatType);

  const detectedPatterns = Array.isArray(res.detectedPatterns) ? res.detectedPatterns : [];
  const explanation = res.explanation || res.ai_explanation || res.aiExplanation || res.reason || '';
  const recommendation = res.recommendation || res.safetyGuidance || '';
  const confidence = typeof res.confidence === 'number' ? res.confidence : (res.ml?.confidence || 0);
  const confidencePct = (confidence * 100).toFixed(1);
  const recommendedModules = Array.isArray(res.recommendedModules) ? res.recommendedModules : [];
  const metrics = Array.isArray(res.metrics) ? res.metrics : [];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Main Risk Tier & Confidence Header */}
      <div className={`${tier.bg} border border-outline-variant/10 rounded-3xl p-6 text-center shadow-lg relative overflow-hidden`}>
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${tier.badgeAccent} mb-3 shadow-md`}>
          <span className="material-symbols-outlined text-3xl icon-fill">{tier.icon}</span>
        </div>

        <div className={`text-2xl font-black ${tier.text} uppercase tracking-wider mb-1`}>
          {levelLabel} {t('label.riskLevel')}
        </div>

        {/* Confidence pill */}
        {confidence > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container/80 backdrop-blur-sm border border-outline-variant/20 text-xs font-semibold text-on-surface mb-2">
            <span className="material-symbols-outlined text-sm text-primary">verified</span>
            <span>{confidencePct}% {t('label.confidence')}</span>
          </div>
        )}

        <div className="text-xs font-medium text-on-surface-variant/80">
          {t('label.riskAssessment')}
        </div>
      </div>

      {/* Status & Threat Metadata */}
      <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-on-surface-variant">{t('label.status')}:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${tier.badge} uppercase tracking-wide`}>
            {statusText}
          </span>
        </div>

        {threatTypeTranslated && (
          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10">
            <span className="text-xs font-semibold text-on-surface-variant">{t('label.threat')}:</span>
            <span className="text-xs font-bold text-on-surface bg-surface-container px-2.5 py-1 rounded-lg">
              {threatTypeTranslated}
            </span>
          </div>
        )}

        {/* Detected Threat Indicators / Patterns */}
        {detectedPatterns.length > 0 && (
          <div className="pt-2 border-t border-outline-variant/10">
            <div className="text-xs font-semibold text-on-surface-variant mb-2">{t('label.threatIndicators')}:</div>
            <div className="flex flex-wrap gap-1.5">
              {detectedPatterns.map((pat, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-error-container/30 text-error text-[11px] font-semibold px-2.5 py-1 rounded-md border border-error/20">
                  <span className="material-symbols-outlined text-xs">warning</span>
                  {translateThreatPattern(pat)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Audio / Scan Metrics if present */}
      {metrics.length > 0 && (
        <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-4 space-y-3">
          <div className="text-xs font-semibold text-on-surface-variant">{t('label.dspMetrics')}:</div>
          {metrics.map((m, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-on-surface-variant">{m.label}</span>
                <span className="font-bold text-on-surface">{m.value}</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${tier.bar}`} style={{ width: `${Math.min(Math.max(m.percent || 50, 0), 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Explanation Box */}
      {explanation && (
        <div className="bg-surface-container-lowest rounded-2xl p-4 border-l-4 border-primary shadow-sm border border-outline-variant/10">
          <div className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">psychology</span>
            {t('label.aiAnalysis')}
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-line">
            {explanation}
          </p>
        </div>
      )}

      {/* Actionable Recommendations Box */}
      {recommendation && (
        <div className="bg-primary-container/20 rounded-2xl p-4 border border-primary/20 shadow-sm">
          <div className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">verified_user</span>
            {t('label.recommendation')}
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {recommendation}
          </p>
        </div>
      )}

      {/* Recommended Educational Modules */}
      {recommendedModules.length > 0 && (
        <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/10 space-y-2">
          <div className="text-xs font-bold text-on-surface flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base text-secondary">school</span>
            {t('label.recommendedModules')}
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendedModules.map((mod, i) => (
              <Link key={i} href="/learn" className="inline-flex items-center gap-1 text-xs bg-secondary-container/30 text-secondary hover:bg-secondary-container/50 px-3 py-1.5 rounded-full font-medium transition-colors">
                <span>{translateModuleTitle(mod)}</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
