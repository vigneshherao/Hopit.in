export const soilTypes = ['red', 'black', 'alluvial', 'laterite', 'clay', 'sandy', 'loamy', 'mixed', 'unknown'];
export const areaUnits = ['acre', 'hectare', 'cent', 'square-feet'];
export const seasons = ['kharif', 'rabi', 'zaid', 'summer', 'winter', 'monsoon', 'year-round'];
export const waterAvailabilityOptions = ['abundant', 'adequate', 'seasonal', 'limited', 'unknown'];
export const experienceLevels = ['beginner', 'intermediate', 'experienced', 'expert'];
export const farmingTypes = ['traditional', 'organic', 'natural', 'commercial', 'mixed', 'precision'];

export const analysisStages = [
  'Analysing soil',
  'Evaluating water',
  'Checking climate',
  'Estimating market demand',
  'Generating recommendations',
];

export function labelize(value) {
  return String(value ?? '').replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatMoneyRange(range) {
  if (!range) return 'Not available';
  return `₹${Number(range.minimum ?? 0).toLocaleString('en-IN')} - ₹${Number(range.maximum ?? 0).toLocaleString('en-IN')}`;
}

export function scoreColor(score = 0) {
  if (score >= 75) return 'bg-emerald-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-rose-500';
}
