import { NavLink, Outlet } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAdminMe } from '@/hooks/useAdmin.js';
import { adminNavItems } from '@/utils/adminData.js';
import { cn } from '@/utils/cn.js';

export function AdminLayout() {
  const { data } = useAdminMe();
  const displayName = data?.profile?.displayName ?? 'Admin';
  const roles = data?.roles?.map((role) => role.name).join(', ') || 'Admin console';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_32rem),linear-gradient(180deg,#ffffff,#f7fbf7)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 lg:flex-row lg:px-6">
        <aside className="lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)] lg:w-72">
          <div className="rounded-3xl border border-emerald-100 bg-white/90 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="flex items-center gap-3 border-b border-emerald-50 pb-4">
              <span className="rounded-2xl bg-emerald-600 p-3 text-white shadow-lg shadow-emerald-500/20">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Hopt It</p>
                <h1 className="text-xl font-black text-slate-950">Admin</h1>
              </div>
            </div>
            <nav className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-1">
              {adminNavItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === '/admin'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition hover:bg-emerald-50',
                      isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600' : 'text-slate-600',
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <div className="mb-5 rounded-3xl border border-white bg-white/80 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.06)] backdrop-blur">
            <p className="text-sm font-semibold text-emerald-700">Admin workspace</p>
            <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-950 sm:text-3xl">Operate Hopt It with confidence</h2>
                <p className="mt-1 text-sm text-slate-500">Signed in as {displayName}. {roles}</p>
              </div>
              <div className="rounded-2xl border border-purple-100 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700">
                Permission aware
              </div>
            </div>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
