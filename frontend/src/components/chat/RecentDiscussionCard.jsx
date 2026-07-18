import { MessageSquareText } from 'lucide-react';

export function RecentDiscussionCard({ discussions = [] }) {
  return (
    <section className="rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-950"><MessageSquareText className="h-4 w-4 text-emerald-600" />Recent discussions</div>
      <div className="mt-4 space-y-2">{discussions.length ? discussions.map((item) => <p key={item._id} className="line-clamp-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700">{item.text || 'Attachment or workspace update'}</p>) : <p className="text-sm text-slate-500">No discussions yet.</p>}</div>
    </section>
  );
}
