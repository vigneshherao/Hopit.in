import { Megaphone } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/cn.js';

export function AnnouncementBanner({ announcements = [] }) {
  const [dismissed, setDismissed] = useState(new Set());
  const active = announcements.find((item) => !dismissed.has(item._id));
  if (!active) return null;
  return (
    <button
      type="button"
      onClick={() => setDismissed((current) => new Set([...current, active._id]))}
      className={cn('mx-4 mt-4 flex items-start gap-3 rounded-3xl border px-4 py-3 text-left shadow-sm sm:mx-6', active.priority === 'critical' ? 'border-rose-200 bg-rose-50 text-rose-900' : active.priority === 'important' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-emerald-100 bg-emerald-50 text-emerald-900')}
    >
      <Megaphone className="mt-0.5 h-5 w-5" />
      <span>
        <span className="block text-sm font-bold">{active.title}</span>
        <span className="block text-xs leading-5 opacity-80">{active.message}</span>
      </span>
    </button>
  );
}
