import { CheckSquare } from 'lucide-react';
import { chatDate } from '@/utils/chatEnterpriseData.js';

export function UpcomingTaskCard({ tasks = [] }) {
  return (
    <section className="rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-950"><CheckSquare className="h-4 w-4 text-emerald-600" />Upcoming tasks</div>
      <div className="mt-4 space-y-2">{tasks.length ? tasks.map((task) => <div key={task._id} className="rounded-2xl bg-slate-50 px-3 py-2 text-sm"><p className="font-semibold text-slate-800">{task.title}</p><p className="text-xs text-slate-500">{task.category} · {chatDate(task.startDate)}</p></div>) : <p className="text-sm text-slate-500">No upcoming tasks linked.</p>}</div>
    </section>
  );
}
