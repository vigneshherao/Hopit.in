import { Activity, MapPinned, UsersRound } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { useHealth } from '@/hooks/useHealth.js';
import { roleDashboards } from '@/types/domain.js';

const metrics = [
  { label: 'Land listings module', value: 'Ready', icon: MapPinned },
  { label: 'Worker module', value: 'Ready', icon: UsersRound },
  { label: 'AI module', value: 'Ready', icon: Activity },
];

export function DashboardPage() {
  const health = useHealth();
  const { user } = useAuth();

  if (user?.role && roleDashboards[user.role]) {
    return <Navigate to={roleDashboards[user.role]} replace />;
  }

  return (
    <section className="page-shell space-y-7">
      <div className="rounded-[32px] border border-emerald-100 bg-white/86 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur">
        <p className="text-sm font-semibold uppercase text-emerald-600">Workspace</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">A foundation view for platform operations.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardDescription>{metric.label}</CardDescription>
                <CardTitle className="mt-2">{metric.value}</CardTitle>
              </div>
              <metric.icon className="h-5 w-5 text-primary" />
            </CardHeader>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>API status</CardTitle>
          <CardDescription>Live backend health endpoint connection.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {health.isLoading && 'Checking backend status...'}
            {health.isError && 'Backend is not reachable from the configured API URL.'}
            {health.data && `Backend healthy. Uptime: ${Number(health.data.uptime).toFixed(2)} seconds.`}
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
