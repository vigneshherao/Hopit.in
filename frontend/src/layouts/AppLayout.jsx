import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Leaf, LogIn, LogOut, Menu, X } from 'lucide-react';
import { navigationItems } from '@/utils/navigationData.js';
import { Button } from '@/components/ui/button.jsx';
import { NotificationBell } from '@/components/realtime/NotificationBell.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { cn } from '@/utils/cn.js';

export function AppLayout() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const visibleNavigationItems = useMemo(
    () =>
      navigationItems.filter((item) => {
        if (item.requiresAuth && !isAuthenticated) return false;
        if (item.roles?.length && !item.roles.includes(user?.role)) return false;
        return true;
      }),
    [isAuthenticated, user?.role],
  );

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  async function handleLogout() {
    setIsMenuOpen(false);
    await logout();
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.12),transparent_28%),linear-gradient(180deg,#ffffff_0%,#f7fff9_45%,#ffffff_100%)]">
      <header className="sticky top-0 z-50 border-b border-emerald-100/70 bg-white/88 shadow-[0_12px_40px_rgba(15,23,42,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <NavLink to="/" className="group flex min-w-0 items-center gap-3 font-semibold text-slate-950">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition group-hover:-translate-y-0.5">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block whitespace-nowrap text-lg font-black tracking-tight">Hopt It</span>
              <span className="hidden whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700 sm:block">AI agriculture</span>
            </span>
          </NavLink>

          <nav className="hidden min-w-0 flex-1 items-center justify-center px-4 lg:flex">
            <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-emerald-100 bg-white/85 p-1 shadow-sm">
              {visibleNavigationItems.slice(0, 10).map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-3 text-sm font-semibold text-slate-500 transition-all hover:bg-emerald-50 hover:text-slate-950 xl:px-4',
                      isActive && 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600 hover:text-white',
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </nav>

          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Button asChild variant="outline" size="sm">
                <NavLink to="/login">
                  <LogIn className="h-4 w-4" />
                  Login
                </NavLink>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            {isAuthenticated ? <NotificationBell /> : null}
            <Button variant="outline" size="icon" onClick={() => setIsMenuOpen((current) => !current)} aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={isMenuOpen}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isMenuOpen ? (
          <div className="border-t border-emerald-100 bg-white/96 px-4 py-4 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:hidden">
            <nav className="mx-auto grid max-w-7xl grid-cols-2 gap-2 sm:grid-cols-3">
              {visibleNavigationItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-12 items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50',
                    isActive && 'border-emerald-500 bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600',
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="min-w-0 truncate">{item.label}</span>
              </NavLink>
            ))}
            </nav>
            <div className="mx-auto mt-3 flex max-w-7xl items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-950">{isAuthenticated ? user?.name ?? 'Hopt It user' : 'Welcome to Hopt It'}</p>
                <p className="text-xs font-medium text-slate-500">{isAuthenticated ? user?.role ?? 'member' : 'Discover verified agriculture opportunities'}</p>
              </div>
              {isAuthenticated ? (
                <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Logout
                </Button>
              ) : (
                <Button asChild variant="default" size="sm">
                  <NavLink to="/login">
                    <LogIn className="h-4 w-4" />
                    Login
                  </NavLink>
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </header>

      <main className="relative">
        <Outlet />
      </main>
    </div>
  );
}
