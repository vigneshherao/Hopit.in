import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { roleLabels } from '@/types/domain.js';
import { cn } from '@/utils/cn.js';

const roleFilters = [
  ['all', 'All'],
  ['owner', 'Owners'],
  ['farmer', 'Land seekers'],
  ['worker', 'Workers'],
  ['admin', 'Admins'],
];

export function NewConversationModal({ open, users = [], isLoading, isError, isStarting, onClose, onSearch, onRoleChange, role, search, onStart }) {
  const [localSearch, setLocalSearch] = useState(search ?? '');
  const filteredUsers = useMemo(() => users, [users]);

  if (!open) return null;

  function submitSearch(event) {
    event.preventDefault();
    onSearch(localSearch);
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="new-conversation-title">
      <div className="w-full max-w-2xl overflow-hidden rounded-[32px] border border-emerald-100 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.24)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">New message</p>
            <h2 id="new-conversation-title" className="mt-1 text-2xl font-semibold text-slate-950">Choose a Hopt It user</h2>
            <p className="mt-1 text-sm text-slate-500">Start a chat with owners, land seekers, workers, or admins without entering a raw user id.</p>
          </div>
          <Button type="button" variant="ghost" size="icon" className="rounded-2xl" onClick={onClose} aria-label="Close new conversation modal">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4 p-5">
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={submitSearch}>
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="h-12 rounded-2xl border-slate-200 bg-slate-50/80 pl-10" value={localSearch} onChange={(event) => setLocalSearch(event.target.value)} placeholder="Search name, role, city..." autoFocus />
            </label>
            <Button type="submit" className="h-12 rounded-2xl">Search</Button>
          </form>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {roleFilters.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => onRoleChange(value === 'all' ? '' : value)}
                className={cn(
                  'shrink-0 rounded-2xl px-4 py-2 text-sm font-semibold transition',
                  (role || 'all') === value ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {isLoading ? Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-20 animate-pulse rounded-3xl bg-emerald-50" />) : null}
            {isError ? <div className="rounded-3xl bg-rose-50 p-5 text-sm font-medium text-rose-700">Unable to load users right now.</div> : null}
            {!isLoading && !isError && filteredUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                className="flex w-full items-center gap-3 rounded-3xl border border-slate-100 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                onClick={() => onStart(user.id)}
                disabled={isStarting}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-emerald-50 text-sm font-bold text-emerald-700">
                  {user.avatar ? <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" /> : user.name?.slice(0, 2)?.toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-slate-950">{user.name}</span>
                  <span className="block truncate text-sm text-slate-500">
                    {roleLabels[user.role] ?? user.role}
                    {user.location?.district || user.location?.state ? ` · ${[user.location?.district, user.location?.state].filter(Boolean).join(', ')}` : ''}
                  </span>
                </span>
                <span className="rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">Message</span>
              </button>
            ))}
            {!isLoading && !isError && !filteredUsers.length ? <div className="rounded-3xl border border-dashed border-emerald-200 bg-white p-8 text-center text-sm text-slate-500">No users matched your search.</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
