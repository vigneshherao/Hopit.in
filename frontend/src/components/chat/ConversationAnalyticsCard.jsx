import { BarChart3 } from 'lucide-react';

export function ConversationAnalyticsCard({ analytics }) {
  const values = [
    ['Daily', analytics?.dailyMessages ?? 0],
    ['Weekly', analytics?.weeklyMessages ?? 0],
    ['Monthly', analytics?.monthlyMessages ?? 0],
    ['Reactions', analytics?.reactionCount ?? 0],
    ['Threads', analytics?.threadCount ?? 0],
  ];
  const max = Math.max(...values.map((item) => item[1]), 1);
  return (
    <section className="rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-950">
        <BarChart3 className="h-4 w-4 text-emerald-600" />
        Conversation analytics
      </div>
      <div className="mt-5 space-y-3">
        {values.map(([label, value]) => (
          <div key={label}>
            <div className="mb-1 flex justify-between text-xs font-semibold text-slate-500"><span>{label}</span><span>{value}</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max((value / max) * 100, value ? 8 : 0)}%` }} /></div>
          </div>
        ))}
      </div>
    </section>
  );
}
