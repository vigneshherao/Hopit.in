import { Bell, CalendarDays, CheckCircle2, CloudSun, FileSignature, Leaf, ShieldAlert, Sprout, Tractor, UserRoundCheck } from 'lucide-react';

export const notificationTabs = [
  { label: 'Unread', value: 'unread' },
  { label: 'All', value: 'all' },
  { label: 'System', value: 'system' },
  { label: 'Tasks', value: 'task' },
  { label: 'Weather', value: 'weather' },
  { label: 'Disease', value: 'disease' },
  { label: 'Monitoring', value: 'monitoring' },
];

export const notificationTypeIcons = {
  system: ShieldAlert,
  agreement: FileSignature,
  application: CheckCircle2,
  worker: UserRoundCheck,
  task: CalendarDays,
  reminder: Bell,
  weather: CloudSun,
  disease: Leaf,
  monitoring: Sprout,
  general: Tractor,
};

export function formatRelativeDate(value) {
  if (!value) return 'Just now';
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function priorityTone(priority = 'medium') {
  return {
    low: 'border-slate-200 bg-slate-50 text-slate-600',
    medium: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    high: 'border-amber-200 bg-amber-50 text-amber-700',
    critical: 'border-rose-200 bg-rose-50 text-rose-700',
  }[priority] ?? 'border-emerald-200 bg-emerald-50 text-emerald-700';
}
