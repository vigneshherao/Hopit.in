import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Command, Home, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Avatar, Chip } from '@/components/ui/data-display.jsx';
import { Dialog } from '@/components/ui/overlays.jsx';
import { SearchBox } from '@/components/ui/navigation.jsx';
import { commandGroups, quickActions, routeLabels } from '@/utils/experienceData.js';
import { cn } from '@/utils/cn.js';

function isVisible(item, isAuthenticated, role) {
  if (item.requiresAuth && !isAuthenticated) return false;
  if (item.roles?.length && !item.roles.includes(role)) return false;
  return true;
}

export function Breadcrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split('/').filter(Boolean);
  const hiddenPaths = new Set(['/login', '/register']);

  if (!parts.length || hiddenPaths.has(pathname)) return null;

  return (
    <nav className="mx-auto hidden w-full max-w-7xl items-center gap-2 px-4 pt-4 text-sm font-semibold text-slate-500 sm:flex sm:px-6 lg:px-8" aria-label="Breadcrumb">
      <Link to="/" className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-slate-500 transition hover:bg-white hover:text-slate-950">
        <Home className="h-3.5 w-3.5" />
        Home
      </Link>
      {parts.slice(0, 3).map((part, index) => {
        const href = `/${parts.slice(0, index + 1).join('/')}`;
        const label = routeLabels[part] ?? part.replaceAll('-', ' ');
        const isLast = index === Math.min(parts.length, 3) - 1;
        return (
          <span key={href} className="inline-flex items-center gap-2">
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            {isLast ? (
              <span className="max-w-[180px] truncate capitalize text-slate-900">{label}</span>
            ) : (
              <Link to={href} className="max-w-[180px] truncate capitalize transition hover:text-slate-950">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function CommandPalette({ open, onOpenChange, isAuthenticated, role }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const filteredGroups = useMemo(
    () =>
      commandGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => {
            if (!isVisible(item, isAuthenticated, role)) return false;
            const haystack = `${item.label} ${item.keywords}`.toLowerCase();
            return haystack.includes(query.trim().toLowerCase());
          }),
        }))
        .filter((group) => group.items.length),
    [isAuthenticated, query, role],
  );

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  function goTo(href) {
    navigate(href);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} title="Search Hopt It" description="Jump to products, workflows, and operations." className="max-w-2xl p-4">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2">
        <SearchBox autoFocus placeholder="Search land, AI, workers, planner..." value={query} onChange={(event) => setQuery(event.target.value)} inputClassName="border-white bg-white shadow-sm" />
      </div>
      <div className="mt-4 max-h-[55vh] overflow-y-auto pr-1">
        {filteredGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="mb-2 px-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">{group.label}</p>
            <div className="grid gap-1">
              {group.items.map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => goTo(item.href)}
                  className="group flex items-center gap-3 rounded-2xl p-3 text-left transition hover:bg-emerald-50 focus:bg-emerald-50 focus:outline-none"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-slate-950">{item.label}</span>
                    <span className="block truncate text-sm text-slate-500">{item.keywords}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                </button>
              ))}
            </div>
          </div>
        ))}
        {!filteredGroups.length ? <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm font-semibold text-slate-500">No matching action found.</p> : null}
      </div>
    </Dialog>
  );
}

export function SidebarNavigation({ items, isAuthenticated, user, onCommand }) {
  return (
    <aside className="pointer-events-none fixed left-4 top-28 z-30 hidden w-20 xl:block">
      <div className="pointer-events-auto rounded-[28px] border border-white/80 bg-white/85 p-2 shadow-[0_22px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl">
        <button
          type="button"
          onClick={onCommand}
          className="mb-2 flex h-12 w-full items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5"
          aria-label="Open command menu"
        >
          <Command className="h-5 w-5" />
        </button>
        <nav className="grid gap-1" aria-label="Primary sidebar">
          {items.slice(0, 9).map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'group relative flex h-12 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700',
                  isActive && 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:text-white',
                )
              }
              aria-label={item.label}
            >
              <item.icon className="h-5 w-5" />
              <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white shadow-lg group-hover:block">
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>
        {isAuthenticated ? (
          <div className="mt-2 border-t border-slate-100 pt-2">
            <Avatar name={user?.name ?? 'Hopt It'} className="mx-auto h-10 w-10" />
          </div>
        ) : null}
      </div>
    </aside>
  );
}

export function FloatingQuickActions({ isAuthenticated, role, onCommand }) {
  const visibleActions = quickActions.filter((item) => isVisible(item, isAuthenticated, role));

  return (
    <div className="fixed bottom-5 right-4 z-40 hidden flex-col gap-2 sm:flex">
      {visibleActions.map((item) => {
        const content = (
          <>
            <item.icon className="h-4 w-4" />
            <span className="sr-only">{item.label}</span>
          </>
        );
        if (item.action === 'command') {
          return (
            <Button key={item.label} type="button" size="icon" className="h-12 w-12 rounded-2xl bg-slate-950 text-white shadow-xl shadow-slate-950/20 hover:bg-slate-800" onClick={onCommand} aria-label={item.label}>
              {content}
            </Button>
          );
        }
        return (
          <Button key={item.label} asChild size="icon" className="h-12 w-12 rounded-2xl shadow-xl shadow-emerald-600/20" aria-label={item.label}>
            <Link to={item.href}>{content}</Link>
          </Button>
        );
      })}
    </div>
  );
}

export function MobileBottomNav({ items, onCommand }) {
  return (
    <div className="fixed inset-x-3 bottom-3 z-40 rounded-[28px] border border-white/80 bg-white/92 p-2 shadow-[0_20px_70px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:hidden">
      <nav className="grid grid-cols-5 gap-1" aria-label="Mobile navigation">
        {items.slice(0, 4).map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn('flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-bold text-slate-500 transition', isActive && 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20')
            }
          >
            <item.icon className="h-4 w-4" />
            <span className="max-w-full truncate">{item.label}</span>
          </NavLink>
        ))}
        <button type="button" onClick={onCommand} className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-bold text-slate-500 transition hover:bg-slate-50">
          <Command className="h-4 w-4" />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
}

export function SearchTrigger({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hidden h-10 min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/85 px-3 text-left text-sm font-semibold text-slate-500 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/50 xl:min-w-[170px] md:flex"
    >
      <span className="inline-flex items-center gap-2">
        <Search className="h-4 w-4" />
        <span className="hidden xl:inline">Search</span>
      </span>
      <Chip className="hidden border-slate-100 px-2 py-0.5 text-[10px] text-slate-400 lg:inline-flex">
        <Command className="h-3 w-3" />
        K
      </Chip>
    </button>
  );
}

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="sticky top-[72px] z-40 border-y border-amber-100 bg-amber-50 px-4 py-2 text-center text-sm font-bold text-amber-800">
      Connection lost. Hopt It will reconnect when the network is back.
    </div>
  );
}

export function ShellStatusPill({ isAuthenticated, user }) {
  if (!isAuthenticated) return null;

  return (
    <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/70 px-3 py-1.5 text-xs font-bold text-emerald-700 xl:flex">
      <Sparkles className="h-3.5 w-3.5" />
      {`${user?.role ?? 'member'} workspace`}
    </div>
  );
}
