import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { roleLabels } from '@/types/domain.js';

const nextFeatures = {
  owner: 'Land listings, application review, lease tracking, and owner analytics.',
  farmer: 'Land discovery, applications, worker booking, and crop planning.',
  worker: 'Worker profile, job invitations, booking calendar, and earnings.',
  admin: 'User moderation, verification queues, marketplace oversight, and audit trails.',
};

export function RoleDashboardPage({ role }) {
  const { user, logout } = useAuth();

  return (
    <section className="page-shell space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Badge variant="secondary">{roleLabels[role]}</Badge>
          <h1 className="mt-3 text-3xl font-bold">Welcome, {user?.name}</h1>
          <p className="mt-2 text-muted-foreground">You are signed in as {roleLabels[user?.role] ?? user?.role}.</p>
        </div>
        <Button variant="outline" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{roleLabels[role]} dashboard</CardTitle>
          <CardDescription>{nextFeatures[role]}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link to="/lands">Lands</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/workers">Workers</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/ai">AI</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/profile">Profile</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
