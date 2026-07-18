import { Star } from 'lucide-react';

export function StarredMessages({ stars = [] }) {
  if (!stars.length) return null;
  return (
    <section className="rounded-3xl border border-purple-100 bg-purple-50/70 p-4">
      <div className="flex items-center gap-2 text-sm font-bold text-purple-900">
        <Star className="h-4 w-4" />
        Starred
      </div>
      <div className="mt-3 space-y-2">
        {stars.slice(0, 4).map((star) => (
          <p key={star._id} className="line-clamp-2 rounded-2xl bg-white px-3 py-2 text-xs text-slate-600 shadow-sm">{star.messageId?.text || 'Saved workspace message'}</p>
        ))}
      </div>
    </section>
  );
}
