import { Pin } from 'lucide-react';
import { chatTime } from '@/utils/chatData.js';

export function PinnedSection({ pins = [], onOpen }) {
  if (!pins.length) return null;
  return (
    <section className="rounded-3xl border border-amber-100 bg-amber-50/70 p-4">
      <div className="flex items-center gap-2 text-sm font-bold text-amber-900">
        <Pin className="h-4 w-4" />
        Pinned messages
      </div>
      <div className="mt-3 space-y-2">
        {pins.slice(0, 3).map((pin) => (
          <button key={pin._id} type="button" onClick={() => onOpen?.(pin.messageId?._id)} className="block w-full rounded-2xl bg-white px-3 py-2 text-left text-xs text-slate-600 shadow-sm">
            <span className="line-clamp-2">{pin.messageId?.text || 'Pinned attachment or update'}</span>
            <span className="mt-1 block text-[11px] text-slate-400">{chatTime(pin.pinnedAt)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
