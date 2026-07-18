export const severityTone = {
  Healthy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Low: 'bg-teal-50 text-teal-700 border-teal-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  High: 'bg-orange-50 text-orange-700 border-orange-200',
  Critical: 'bg-red-50 text-red-700 border-red-200',
};

export const healthColor = (score = 0) => {
  if (score >= 95) return '#059669';
  if (score >= 80) return '#0d9488';
  if (score >= 60) return '#d97706';
  if (score >= 40) return '#ea580c';
  return '#dc2626';
};

export const healthLabel = (score = 0) => {
  if (score >= 95) return 'Excellent';
  if (score >= 80) return 'Healthy';
  if (score >= 60) return 'Average';
  if (score >= 40) return 'Poor';
  return 'Critical';
};

export function formatDiseaseDate(value) {
  if (!value) return 'Not set';
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function validateDiseaseFiles(files) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024;
  if (files.length > 5) return 'Upload up to 5 images only.';
  const invalid = files.find((file) => !allowed.includes(file.type) || file.size > maxSize);
  if (invalid) return 'Only JPEG, PNG or WEBP images up to 10 MB are supported.';
  return '';
}

