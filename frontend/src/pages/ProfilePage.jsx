import { Badge } from '@/components/ui/badge.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';

export function ProfilePage() {
  return (
    <section className="page-shell">
      <Card>
        <CardHeader>
          <Badge className="w-fit" variant="secondary">
            Account foundation
          </Badge>
          <CardTitle>Profile</CardTitle>
          <CardDescription>User identity, role, contact details, and preferences will live here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">Role model</p>
              <p className="mt-2 font-medium">Land owner, farmer, or farm worker</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">Verification</p>
              <p className="mt-2 font-medium">Ready for KYC and profile checks</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">Preferences</p>
              <p className="mt-2 font-medium">Ready for notification settings</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
