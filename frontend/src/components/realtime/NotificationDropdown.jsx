import { Link } from 'react-router-dom';
import { NotificationCard } from '@/components/realtime/NotificationCard.jsx';
import { Button } from '@/components/ui/button.jsx';

export function NotificationDropdown({ notifications = [], onRead, onDelete, onReadAll }) {
  return (
    <div className="absolute right-0 top-12 z-50 w-[min(92vw,390px)] rounded-3xl border border-emerald-100 bg-white/95 p-3 shadow-2xl shadow-emerald-900/10 backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between px-1">
        <div>
          <p className="text-sm font-semibold text-slate-950">Live updates</p>
          <p className="text-xs text-slate-500">Notifications from your farms</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onReadAll}>
          Read all
        </Button>
      </div>
      <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
        {notifications.length ? (
          notifications.slice(0, 5).map((item) => <NotificationCard key={item._id ?? item.id} notification={item} onRead={onRead} onDelete={onDelete} compact />)
        ) : (
          <div className="rounded-2xl bg-emerald-50 p-5 text-sm text-emerald-800">No notifications yet.</div>
        )}
      </div>
      <Button asChild className="mt-3 w-full">
        <Link to="/notifications">Open notification center</Link>
      </Button>
    </div>
  );
}
