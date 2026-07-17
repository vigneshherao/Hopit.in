import { NavLink, Outlet } from 'react-router-dom';
import { Leaf, LogIn, LogOut } from 'lucide-react';
import { navigationItems } from '@/constants/navigation.js';
import { Button } from '@/components/ui/button.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { cn } from '@/utils/cn.js';

export function AppLayout() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <NavLink to="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Leaf className="h-5 w-5" />
            </span>
            <span>Hopit</span>
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex">
            {navigationItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                    isActive && 'bg-muted text-foreground',
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {isAuthenticated ? (
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm">
              <NavLink to="/login">
                <LogIn className="h-4 w-4" />
                Login
              </NavLink>
            </Button>
          )}
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
