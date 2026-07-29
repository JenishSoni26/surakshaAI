// Static class-name lookup for risk tiers. Tailwind's build-time scanner
// can only find utility classes that appear as literal strings in source,
// so this must never be built via string interpolation (e.g. `bg-${color}-container`)
// or the generated CSS will be missing those classes in production builds.
export function getRiskTier(score) {
  if (score >= 70) {
    return {
      label: 'High Risk',
      bg: 'bg-error-container/20',
      text: 'text-error',
      badge: 'bg-error-container text-on-error-container',
      bar: 'bg-error',
    };
  }
  if (score >= 40) {
    return {
      label: 'Moderate Risk',
      bg: 'bg-tertiary-container/20',
      text: 'text-tertiary',
      badge: 'bg-tertiary-container text-on-tertiary-container',
      bar: 'bg-tertiary',
    };
  }
  return {
    label: 'Safe',
    bg: 'bg-success/10',
    text: 'text-success',
    badge: 'bg-success/10 text-success',
    bar: 'bg-success',
  };
}
