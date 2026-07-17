import { NavLink, Outlet } from 'react-router-dom';
import { Leaf, LogIn, LogOut } from 'lucide-react';
import { navigationItems } from '@/constants/navigation.js';
import { Button } from '@/components/ui/button.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { cn } from '@/utils/cn.js';

export function AppLayout() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.12),transparent_28%),linear-gradient(180deg,#ffffff_0%,#f7fff9_45%,#ffffff_100%)]">
      <header className="sticky top-0 z-50 border-b border-emerald-100/70 bg-white/82 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:flex-nowrap lg:px-8">
          <NavLink to="/" className="flex items-center gap-2 font-semibold text-slate-950">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="whitespace-nowrap">AgriLink AI</span>
          </NavLink>

          <nav className="order-3 -mx-1 flex w-full gap-1 overflow-x-auto pb-1 lg:order-2 lg:mx-0 lg:w-auto lg:justify-center lg:overflow-visible lg:pb-0">
            {navigationItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl px-3 text-sm font-medium text-slate-500 transition-all hover:bg-emerald-50 hover:text-slate-950',
                    isActive && 'bg-emerald-100 text-emerald-700 shadow-sm',
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {isAuthenticated ? (
            <Button className="order-2 lg:order-3" variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          ) : (
            <Button asChild className="order-2 lg:order-3" variant="outline" size="sm">
              <NavLink to="/login">
                <LogIn className="h-4 w-4" />
                Login
              </NavLink>
            </Button>
          )}
        </div>
      </header>

      <main className="relative">
        <Outlet />
      </main>
    </div>
  );
}
