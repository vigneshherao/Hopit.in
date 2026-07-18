export const farmPlanStatuses = ['draft', 'active', 'paused', 'completed', 'cancelled'];
export const farmPlanStages = ['planning', 'land-preparation', 'seed-selection', 'sowing', 'irrigation', 'fertilizer', 'pest-management', 'growth-monitoring', 'harvest', 'post-harvest', 'completed'];

export function labelize(value) {
  return String(value ?? '').replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatCurrency(value) {
  return `₹${Number(value ?? 0).toLocaleString('en-IN')}`;
}

export function riskTone(level) {
  if (level === 'high') return 'text-rose-700 bg-rose-50';
  if (level === 'medium') return 'text-amber-700 bg-amber-50';
  return 'text-emerald-700 bg-emerald-50';
}
