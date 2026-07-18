import { CircleDot } from 'lucide-react';
import { formatRelativeDate } from '@/utils/realtimeData.js';

export function ActivityCard({ activity }) {
  return (
    <article className="relative rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
      <span className="absolute -left-2 top-6 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white ring-4 ring-emerald-50">
        <CircleDot className="h-3 w-3" />
      </span>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">{activity.entityType} · {activity.action}</p>
          <h3 className="mt-1 text-base font-semibold text-slate-950">{activity.title}</h3>
          {activity.description && <p className="mt-2 text-sm leading-6 text-slate-600">{activity.description}</p>}
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{formatRelativeDate(activity.createdAt)}</span>
      </div>
    </article>
  );
}
