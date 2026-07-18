import { cn } from '@/utils/cn.js';

const tones = {
  online: 'bg-emerald-500',
  away: 'bg-amber-400',
  busy: 'bg-rose-500',
  invisible: 'bg-slate-400',
  offline: 'bg-slate-300',
};

export function PresenceDot({ status = 'offline', className }) {
  return <span className={cn('inline-flex h-2.5 w-2.5 rounded-full ring-2 ring-white', tones[status] ?? tones.offline, className)} title={status} />;
}
