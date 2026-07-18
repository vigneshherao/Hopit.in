export const weatherPriorityTone = {
  Critical: 'border-red-200 bg-red-50 text-red-700',
  High: 'border-orange-200 bg-orange-50 text-orange-700',
  Medium: 'border-amber-200 bg-amber-50 text-amber-700',
  Low: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

export function formatWeatherDate(value) {
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function weatherIcon(condition = '') {
  const lower = condition.toLowerCase();
  if (lower.includes('rain')) return 'Rain';
  if (lower.includes('hot')) return 'Heat';
  if (lower.includes('cloud')) return 'Cloud';
  return 'Clear';
}

