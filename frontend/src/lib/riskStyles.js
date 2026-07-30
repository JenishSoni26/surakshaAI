
// Static class-name lookup for risk tiers. Tailwind's build-time scanner
// can only find utility classes that appear as literal strings in source,
// so this must never be built via string interpolation (e.g. `bg-${color}-container`)
// or the generated CSS will be missing those classes in production builds.
export function getRiskTier(score) {
  if (score >= 70) {
    return {
      level: 'high',
      labelKey: 'risk.high',
      fallbackLabel: 'High',
      icon: 'error',
      bg: 'bg-error-container/20',
      text: 'text-error',
      badge: 'bg-error-container text-on-error-container',
      badgeAccent: 'bg-error/10 text-error border border-error/20',
      bar: 'bg-error',
      glow: 'shadow-error/20',
    };
  }
  if (score >= 40) {
    return {
      level: 'medium',
      labelKey: 'risk.medium',
      fallbackLabel: 'Medium',
      icon: 'warning',
      bg: 'bg-tertiary-container/20',
      text: 'text-tertiary',
      badge: 'bg-tertiary-container text-on-tertiary-container',
      badgeAccent: 'bg-tertiary/10 text-tertiary border border-tertiary/20',
      bar: 'bg-tertiary',
      glow: 'shadow-tertiary/20',
    };
  }
  return {
    level: 'low',
    labelKey: 'risk.low',
    fallbackLabel: 'Low',
    icon: 'check_circle',
    bg: 'bg-success/10',
    text: 'text-success',
    badge: 'bg-success/10 text-success',
    badgeAccent: 'bg-success/10 text-success border border-success/20',
    bar: 'bg-success',
    glow: 'shadow-success/20',
  };
}
