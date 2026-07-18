import { useMemo, useState } from 'react';
import { BellRing, Search } from 'lucide-react';
import { NotificationCard } from '@/components/realtime/NotificationCard.jsx';
import { NotificationPreferenceForm } from '@/components/realtime/NotificationPreferenceForm.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { notificationTabs } from '@/utils/realtimeData.js';
import { useDeleteNotification, useNotifications, useReadAllNotifications, useReadNotification } from '@/hooks/useRealtime.js';
import { useNotificationsSocket } from '@/hooks/useSocket.js';
import { cn } from '@/utils/cn.js';

export function NotificationsPage() {
  const [tab, setTab] = useState('unread');
  const [search, setSearch] = useState('');
  useNotificationsSocket();
  const params = useMemo(() => ({ search, status: tab === 'unread' ? 'unread' : undefined, type: ['all', 'unread'].includes(tab) ? undefined : tab }), [search, tab]);
  const { data, isLoading, isError } = useNotifications(params);
  const readNotification = useReadNotification();
  const readAll = useReadAllNotifications();
  const deleteNotification = useDeleteNotification();

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-900/8 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-600">Notification center</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">Live updates across Hopt It</h1>
            <p className="mt-3 max-w-2xl text-slate-600">Track task alerts, weather risks, agreements, disease reports, monitoring zones, and system messages in one place.</p>
          </div>
          <Button type="button" onClick={() => readAll.mutate()} disabled={readAll.isPending}>
            <BellRing className="h-4 w-4" />
            Mark all read
          </Button>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <div className="flex flex-col gap-3 rounded-3xl border border-slate-100 bg-slate-50/80 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
                {notificationTabs.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setTab(item.value)}
                    className={cn('shrink-0 rounded-2xl px-4 py-2 text-sm font-semibold transition', tab === item.value ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-white text-slate-500 hover:text-slate-950')}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <label className="relative min-w-0 sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notifications" />
              </label>
            </div>

            <div className="mt-5 space-y-3">
              {isLoading && Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-3xl bg-emerald-50" />)}
              {isError && <div className="rounded-3xl bg-rose-50 p-6 text-rose-700">Unable to load notifications.</div>}
              {!isLoading && !isError && (data?.notifications ?? []).map((item) => (
                <NotificationCard key={item._id ?? item.id} notification={item} onRead={(id) => readNotification.mutate(id)} onDelete={(id) => deleteNotification.mutate(id)} />
              ))}
              {!isLoading && !isError && !(data?.notifications ?? []).length && <div className="rounded-3xl border border-dashed border-emerald-200 bg-white p-10 text-center text-slate-500">No notifications match this view.</div>}
            </div>
          </div>
          <NotificationPreferenceForm />
        </div>
      </div>
    </section>
  );
}
