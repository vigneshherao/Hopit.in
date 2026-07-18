import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LogIn, LogOut, Menu, Sparkles, X } from 'lucide-react';
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
} from '@/components/shared/AppShellEnhancements.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import webLogo from '@/assets/weblogo.png';
import { cn } from '@/utils/cn.js';

const publicPrimaryHrefs = ['/', '/lands', '/workers', '/farm-jobs', '/ai-analyzer'];
const memberPrimaryHrefs = ['/dashboard', '/lands', '/workers', '/ai-analyzer'];
const ownerPrimaryHrefs = ['/dashboard', '/lands', '/my-lands', '/farm-planner', '/ai-analyzer'];
const adminPrimaryHrefs = ['/dashboard', '/lands', '/admin', '/admin/moderation', '/ai-analyzer'];

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

  const primaryNavigationItems = useMemo(() => {
    const preferredHrefs = user?.role === 'admin' ? adminPrimaryHrefs : user?.role === 'owner' ? ownerPrimaryHrefs : isAuthenticated ? memberPrimaryHrefs : publicPrimaryHrefs;
    const prioritized = preferredHrefs
      .map((href) => visibleNavigationItems.find((item) => item.href === href))
      .filter(Boolean);
    const activeItem = visibleNavigationItems.find((item) => location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(`${item.href}/`)));

    if (activeItem && !prioritized.some((item) => item.href === activeItem.href)) {
      return [...prioritized.slice(0, 4), activeItem];
    }

    return prioritized.slice(0, 5);
  }, [isAuthenticated, location.pathname, user?.role, visibleNavigationItems]);

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

      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/88 shadow-[0_12px_40px_rgba(15,23,42,0.045)] backdrop-blur-xl">
        <div className="mx-auto grid min-h-[72px] max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <NavLink to="/" className="group flex shrink-0 items-center rounded-full font-semibold text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" aria-label="Hopt It home">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl transition group-hover:-translate-y-0.5 sm:h-16 sm:w-16">
              <img src={webLogo} alt="Hopt It logo" className="h-full w-full object-cover" />
            </span>
          </NavLink>

          <nav className="hidden min-w-0 items-center justify-center lg:flex">
            <div className="flex max-w-full items-center gap-1 rounded-full border border-slate-200 bg-white/90 p-1 shadow-sm">
              {primaryNavigationItems.map((item) => (
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

          <div className="hidden min-w-0 shrink-0 items-center justify-end gap-2 lg:flex">
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
              <Button asChild variant="default" size="sm">
                <NavLink to="/login">
                  <LogIn className="h-4 w-4" />
                  Login
                </NavLink>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setIsMenuOpen((current) => !current)} aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={isMenuOpen}>
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              Menu
            </Button>
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
          <div className="border-t border-slate-200 bg-white/96 px-4 py-4 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <nav className="mx-auto grid max-w-7xl grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
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
