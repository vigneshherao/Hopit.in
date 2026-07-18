import { ActivityCard } from '@/components/realtime/ActivityCard.jsx';

export function ActivityTimeline({ activities = [] }) {
  if (!activities.length) {
    return <div className="rounded-3xl border border-dashed border-emerald-200 bg-white p-10 text-center text-slate-500">No activity yet. Live farm events will appear here.</div>;
  }

  return (
    <div className="relative space-y-4 border-l border-emerald-100 pl-5">
      {activities.map((activity) => <ActivityCard key={activity._id ?? activity.id} activity={activity} />)}
    </div>
  );
}
