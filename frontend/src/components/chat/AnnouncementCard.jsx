import { Megaphone } from 'lucide-react';
import { chatTime } from '@/utils/chatData.js';

export function AnnouncementCard({ announcement }) {
  return (
    <article className="rounded-2xl bg-white px-3 py-2 text-xs shadow-sm">
      <div className="flex items-center gap-2 font-bold text-slate-800">
        <Megaphone className="h-3.5 w-3.5 text-emerald-600" />
        {announcement.title}
      </div>
      <p className="mt-1 line-clamp-2 text-slate-500">{announcement.message}</p>
      <p className="mt-1 text-[11px] capitalize text-slate-400">{announcement.priority} · {chatTime(announcement.createdAt)}</p>
    </article>
  );
}
