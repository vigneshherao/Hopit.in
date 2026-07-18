export const suggestedAssistantQuestions = [
  'What should I do today?',
  'What is my biggest risk?',
  'Am I overspending?',
  'How much profit can I expect?',
  'When is my harvest?',
  'Which tasks are delayed?',
  'How many workers do I need?',
  'Should I irrigate today?',
  'What fertilizer should I apply next?',
  'Which expense category is highest?',
];

export const priorityTone = {
  Critical: 'border-red-200 bg-red-50 text-red-700',
  High: 'border-orange-200 bg-orange-50 text-orange-700',
  Medium: 'border-amber-200 bg-amber-50 text-amber-700',
  Low: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

export const healthTone = {
  Excellent: 'text-emerald-700 bg-emerald-50',
  Good: 'text-teal-700 bg-teal-50',
  Average: 'text-amber-700 bg-amber-50',
  Poor: 'text-orange-700 bg-orange-50',
  Critical: 'text-red-700 bg-red-50',
};

export function formatAssistantDate(value) {
  if (!value) return 'Not set';
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

