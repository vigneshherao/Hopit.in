import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { useMyJobApplications, useMyWorkerProfile, useWorkerBookings } from '@/hooks/useWorkers.js';
import { displayWorkerPrice, workerRoleLabels } from '@/utils/workerData.js';

export function WorkerDashboardPage() {
  const profileQuery = useMyWorkerProfile();
  const applicationsQuery = useMyJobApplications();
  const bookingsQuery = useWorkerBookings();
  const profile = profileQuery.data?.profile;
  const applications = applicationsQuery.data?.applications ?? [];
  const bookings = bookingsQuery.data?.bookings ?? [];

  return (
    <section className="page-shell space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-[32px] border border-emerald-100 bg-white/90 p-6 shadow-sm lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-emerald-600">Worker dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">{profile?.headline ?? 'Build your agriculture work profile'}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Track applications, bookings, verification, and long-term farm-management assignments from one place.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild><Link to="/farm-jobs">Find jobs</Link></Button>
          <Button asChild variant="outline"><Link to="/worker/profile/edit">{profile ? 'Edit profile' : 'Create profile'}</Link></Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Applications" value={applications.length} />
        <Metric label="Bookings" value={bookings.length} />
        <Metric label="Completed jobs" value={profile?.completedJobs ?? 0} />
        <Metric label="Profile views" value={profile?.profileViews ?? 0} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
        <Card>
          <CardHeader><CardTitle>Profile readiness</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {profile ? (
              <>
                <div className="flex items-center justify-between gap-3"><span className="text-sm text-muted-foreground">Verification</span><Badge>{profile.identityVerification?.status ?? 'not-submitted'}</Badge></div>
                <div className="flex items-center justify-between gap-3"><span className="text-sm text-muted-foreground">Rate</span><strong>{displayWorkerPrice(profile)}</strong></div>
                <div className="flex flex-wrap gap-2">{profile.professionalRoles?.map((role) => <Badge key={role} variant="secondary">{workerRoleLabels[role] ?? role}</Badge>)}</div>
                <Button asChild className="w-full" variant="outline"><Link to="/worker/profile">Open full profile</Link></Button>
              </>
            ) : (
              <div className="rounded-3xl bg-emerald-50 p-5 text-sm text-muted-foreground">Create a verified profile before applying to jobs or accepting bookings.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent bookings</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {bookings.slice(0, 4).map((booking) => (
              <div key={booking._id} className="flex flex-col justify-between gap-2 rounded-2xl border border-emerald-100 p-4 sm:flex-row sm:items-center">
                <div><p className="font-semibold">{booking.workTitle}</p><p className="text-sm text-muted-foreground">{booking.status} · {booking.progress?.percentage ?? 0}% complete</p></div>
                <Button asChild size="sm" variant="outline"><Link to={`/worker-bookings/${booking._id}`}>Open</Link></Button>
              </div>
            ))}
            {!bookings.length ? <p className="rounded-3xl bg-slate-50 p-5 text-sm text-muted-foreground">No bookings yet. Apply to open jobs to start building your work history.</p> : null}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
      </CardContent>
    </Card>
  );
}
