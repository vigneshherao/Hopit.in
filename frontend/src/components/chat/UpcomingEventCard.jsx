import { CalendarDays } from 'lucide-react';
import { chatDate } from '@/utils/chatEnterpriseData.js';

export function UpcomingEventCard({ events = [] }) {
  return (
    <section className="rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-950"><CalendarDays className="h-4 w-4 text-emerald-600" />Upcoming events</div>
      <div className="mt-4 space-y-2">{events.length ? events.map((event) => <div key={event._id} className="rounded-2xl bg-slate-50 px-3 py-2 text-sm"><p className="font-semibold text-slate-800">{event.title}</p><p className="text-xs text-slate-500">{chatDate(event.startDate)}</p></div>) : <p className="text-sm text-slate-500">No upcoming calendar events.</p>}</div>
    </section>
  );
}
