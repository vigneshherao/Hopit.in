import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { NotificationCard } from '@/components/realtime/NotificationCard.jsx';
import { Button } from '@/components/ui/button.jsx';

export function NotificationDropdown({ notifications = [], onRead, onDelete, onReadAll, onClose }) {
  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[900] cursor-default bg-slate-950/18 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close live updates backdrop"
      />
      <div className="fixed right-3 top-20 z-[901] w-[calc(100vw-1.5rem)] max-w-[430px] overflow-hidden rounded-[28px] border border-emerald-100 bg-white shadow-[0_34px_110px_rgba(15,23,42,0.28)] sm:right-6 lg:right-8">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-white p-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-950">Live updates</p>
            <p className="text-xs text-slate-500">Notifications from your farms</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={onReadAll}>
              Read all
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-2xl" onClick={onClose} aria-label="Close live updates">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="max-h-[min(460px,calc(100vh-220px))] space-y-2 overflow-y-auto bg-white p-3">
          {notifications.length ? (
            notifications.slice(0, 5).map((item) => <NotificationCard key={item._id ?? item.id} notification={item} onRead={onRead} onDelete={onDelete} compact />)
          ) : (
            <div className="rounded-2xl bg-emerald-50 p-5 text-sm text-emerald-800">No notifications yet.</div>
          )}
        </div>
        <div className="border-t border-slate-100 bg-white p-3">
          <Button asChild className="h-11 w-full rounded-2xl" onClick={onClose}>
            <Link to="/notifications">Open notification center</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
