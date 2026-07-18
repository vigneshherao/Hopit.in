import { Activity } from 'lucide-react';
import { chatTime } from '@/utils/chatData.js';

export function TeamActivityCard({ activities = [] }) {
  return (
    <section className="rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-950"><Activity className="h-4 w-4 text-emerald-600" />Activity timeline</div>
      <div className="mt-4 space-y-3">
        {activities.length ? activities.map((activity) => (
          <div key={activity._id} className="border-l-2 border-emerald-200 pl-3">
            <p className="text-sm font-semibold text-slate-800">{activity.activityType}</p>
            <p className="text-xs text-slate-500">{activity.actorId?.name ?? 'System'} · {chatTime(activity.createdAt)}</p>
          </div>
        )) : <p className="text-sm text-slate-500">No activity yet.</p>}
      </div>
    </section>
  );
}
