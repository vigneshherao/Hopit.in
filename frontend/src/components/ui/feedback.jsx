import { AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn.js';
import { Button } from '@/components/ui/button.jsx';

export function LoadingSpinner({ label = 'Loading', className }) {
  return (
    <div className={cn('inline-flex items-center gap-2 text-sm font-semibold text-emerald-700', className)}>
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{label}</span>
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-2xl bg-gradient-to-r from-slate-100 via-emerald-50 to-slate-100 bg-[length:200%_100%]', className)} />;
}

export function Alert({ variant = 'info', title, description, actionLabel, onAction, className }) {
  const tone = {
    info: 'border-blue-100 bg-blue-50 text-blue-900',
    success: 'border-emerald-100 bg-emerald-50 text-emerald-900',
    warning: 'border-amber-100 bg-amber-50 text-amber-900',
    error: 'border-rose-100 bg-rose-50 text-rose-900',
  }[variant];
  const Icon = variant === 'success' ? CheckCircle2 : AlertCircle;

  return (
    <div className={cn('flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-start sm:justify-between', tone, className)}>
      <div className="flex gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          {title ? <p className="font-bold">{title}</p> : null}
          {description ? <p className="mt-1 text-sm leading-6 opacity-80">{description}</p> : null}
        </div>
      </div>
      {actionLabel ? (
        <Button type="button" variant="outline" size="sm" onClick={onAction} className="bg-white/70">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({ icon: Icon = Sparkles, title, description, action, className }) {
  return (
    <div className={cn('rounded-3xl border border-dashed border-emerald-200 bg-white/85 p-8 text-center shadow-sm', className)}>
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-lg font-black text-slate-950">{title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Toast({ variant = 'success', title, description, className }) {
  const tone = variant === 'error' ? 'border-rose-100 bg-rose-50 text-rose-900' : 'border-emerald-100 bg-white text-slate-900';
  return (
    <div className={cn('rounded-2xl border p-4 shadow-[0_18px_55px_rgba(15,23,42,0.12)]', tone, className)}>
      <p className="font-bold">{title}</p>
      {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
    </div>
  );
}
