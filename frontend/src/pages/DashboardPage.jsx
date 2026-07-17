import { Activity, MapPinned, UsersRound } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { useHealth } from '@/hooks/useHealth.js';

const metrics = [
  { label: 'Land listings module', value: 'Ready', icon: MapPinned },
  { label: 'Worker module', value: 'Ready', icon: UsersRound },
  { label: 'AI module', value: 'Ready', icon: Activity },
];

export function DashboardPage() {
  const health = useHealth();

  return (
    <section className="page-shell space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
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
