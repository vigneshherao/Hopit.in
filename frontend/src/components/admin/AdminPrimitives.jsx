import { BadgeCheck, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { cn } from '@/utils/cn.js';

export function AdminStatusBadge({ value }) {
  const normalized = String(value ?? 'unknown').toLowerCase();
  const tone =
    normalized.includes('active') || normalized.includes('approved') || normalized.includes('success')
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
      : normalized.includes('pending') || normalized.includes('review')
        ? 'bg-purple-50 text-purple-700 ring-purple-100'
        : normalized.includes('reject') || normalized.includes('suspend') || normalized.includes('failed')
          ? 'bg-rose-50 text-rose-700 ring-rose-100'
          : 'bg-slate-50 text-slate-700 ring-slate-100';

  return <Badge className={cn('rounded-full px-3 py-1 text-xs font-semibold ring-1', tone)}>{String(value ?? 'Unknown')}</Badge>;
}

export function AdminMetricCard({ label, value, helper, icon: Icon = BadgeCheck }) {
  return (
    <Card className="overflow-hidden border-emerald-100/80 bg-white">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{value ?? 0}</p>
          {helper ? <p className="mt-2 text-xs text-slate-500">{helper}</p> : null}
        </div>
        <span className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 ring-1 ring-emerald-100">
          <Icon className="h-5 w-5" />
        </span>
      </CardContent>
    </Card>
  );
}

export function AdminPanel({ title, description, action, children, className }) {
  return (
    <Card className={cn('border-emerald-100 bg-white', className)}>
      <CardContent className="p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">{title}</h2>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          {action}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

export function AdminLoadingState({ label = 'Loading admin data' }) {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-3xl border border-emerald-100 bg-white/80">
      <div className="flex items-center gap-3 text-sm font-semibold text-emerald-700">
        <Loader2 className="h-5 w-5 animate-spin" />
        {label}
      </div>
    </div>
  );
}

export function AdminErrorState({ message = 'Unable to load admin data.' }) {
  return <div className="rounded-3xl border border-rose-100 bg-rose-50 p-5 text-sm font-medium text-rose-700">{message}</div>;
}

export function AdminEmptyState({ title, description }) {
  return (
    <div className="rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/40 p-8 text-center">
      <p className="text-base font-bold text-slate-950">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}

export function getByPath(source, path) {
  return path.split('.').reduce((value, key) => value?.[key], source);
}
