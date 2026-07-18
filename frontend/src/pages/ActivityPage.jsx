import { useMemo, useState } from 'react';
import { Activity, Search } from 'lucide-react';
import { ActivityTimeline } from '@/components/realtime/ActivityTimeline.jsx';
import { Input } from '@/components/ui/input.jsx';
import { useActivities } from '@/hooks/useRealtime.js';
import { useActivitySocket } from '@/hooks/useSocket.js';

const filters = ['all', 'farm', 'task', 'agreement', 'weather', 'disease', 'monitoring'];

export function ActivityPage() {
  const [search, setSearch] = useState('');
  const [entityType, setEntityType] = useState('all');
  useActivitySocket();
  const params = useMemo(() => ({ search, entityType: entityType === 'all' ? undefined : entityType }), [entityType, search]);
  const { data, isLoading, isError } = useActivities(params);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-2xl shadow-emerald-900/8 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/20">
            <Activity className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-600">Activity feed</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Every farm event, in order</h1>
            <p className="mt-3 max-w-2xl text-slate-600">A persistent timeline for agreements, tasks, monitoring reports, AI work, weather warnings, and operations.</p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-100 bg-slate-50/80 p-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setEntityType(filter)}
                  className={`shrink-0 rounded-2xl px-4 py-2 text-sm font-semibold capitalize transition ${entityType === filter ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-white text-slate-500 hover:text-slate-950'}`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <label className="relative lg:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search activity" />
            </label>
          </div>
        </div>

        <div className="mt-8">
          {isLoading && <div className="h-72 animate-pulse rounded-3xl bg-emerald-50" />}
          {isError && <div className="rounded-3xl bg-rose-50 p-6 text-rose-700">Unable to load activity.</div>}
          {!isLoading && !isError && <ActivityTimeline activities={data?.activities ?? []} />}
        </div>
      </div>
    </section>
  );
}
