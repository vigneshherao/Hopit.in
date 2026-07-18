import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Leaf, LogIn, LogOut, Menu, Sparkles, X } from 'lucide-react';
import { navigationItems } from '@/utils/navigationData.js';
import { Button } from '@/components/ui/button.jsx';
import { NotificationBell } from '@/components/realtime/NotificationBell.jsx';
import {
  Breadcrumbs,
  CommandPalette,
  FloatingQuickActions,
  MobileBottomNav,
  OfflineBanner,
  SearchTrigger,
  ShellStatusPill,
  SidebarNavigation,
} from '@/components/shared/AppShellEnhancements.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { cn } from '@/utils/cn.js';

export function AppLayout() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
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

  useEffect(() => {
    function handleShortcut(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsCommandOpen(true);
      }
    }

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  async function handleLogout() {
    setIsMenuOpen(false);
    await logout();
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.10),transparent_30rem),radial-gradient(circle_at_12%_18%,rgba(37,99,235,0.07),transparent_24rem),linear-gradient(180deg,#ffffff_0%,#f8fafc_46%,#ffffff_100%)] text-slate-950">
      <CommandPalette open={isCommandOpen} onOpenChange={setIsCommandOpen} isAuthenticated={isAuthenticated} role={user?.role} />
      <SidebarNavigation items={visibleNavigationItems} isAuthenticated={isAuthenticated} user={user} onCommand={() => setIsCommandOpen(true)} />

      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/88 shadow-[0_12px_40px_rgba(15,23,42,0.045)] backdrop-blur-xl">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <NavLink to="/" className="group flex min-w-0 items-center gap-3 rounded-full pr-2 font-semibold text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-slate-950 text-white shadow-lg shadow-emerald-500/20 transition group-hover:-translate-y-0.5">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block whitespace-nowrap text-lg font-black tracking-tight">Hopt It</span>
              <span className="hidden whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700 sm:block">AI agriculture</span>
            </span>
          </NavLink>

          <nav className="hidden min-w-0 flex-1 items-center justify-center px-2 lg:flex">
            <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-slate-200 bg-white/90 p-1 shadow-sm">
              {visibleNavigationItems.slice(0, 8).map((item) => (
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
            <SearchTrigger onClick={() => setIsCommandOpen(true)} />
            <ShellStatusPill isAuthenticated={isAuthenticated} user={user} />
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
            <Button variant="outline" size="icon" onClick={() => setIsCommandOpen(true)} aria-label="Open search">
              <Sparkles className="h-5 w-5" />
            </Button>
            {isAuthenticated ? <NotificationBell /> : null}
            <Button variant="outline" size="icon" onClick={() => setIsMenuOpen((current) => !current)} aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={isMenuOpen}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isMenuOpen ? (
          <div className="border-t border-slate-200 bg-white/96 px-4 py-4 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:hidden">
            <nav className="mx-auto grid max-w-7xl grid-cols-2 gap-2 sm:grid-cols-3">
              {visibleNavigationItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50',
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
      <OfflineBanner />
      <Breadcrumbs />

      <main className="relative pb-24 sm:pb-0">
        <Outlet />
      </main>
      <FloatingQuickActions isAuthenticated={isAuthenticated} role={user?.role} onCommand={() => setIsCommandOpen(true)} />
      <MobileBottomNav items={visibleNavigationItems} onCommand={() => setIsCommandOpen(true)} />
    </div>
  );
}
