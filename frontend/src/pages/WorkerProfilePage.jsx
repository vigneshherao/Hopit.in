import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { useMyWorkerProfile, useSubmitWorkerVerification } from '@/hooks/useWorkers.js';
import { displayWorkerPrice, workerRoleLabels } from '@/utils/workerData.js';

export function WorkerProfilePage() {
  const profileQuery = useMyWorkerProfile();
  const submitVerification = useSubmitWorkerVerification();
  const profile = profileQuery.data?.profile;

  if (profileQuery.isLoading) return <section className="page-shell"><div className="h-80 animate-pulse rounded-3xl bg-emerald-50" /></section>;

  return (
    <section className="page-shell space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-[32px] border border-emerald-100 bg-white/90 p-6 shadow-sm sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-emerald-600">Worker profile</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">{profile ? profile.headline : 'Create your worker profile'}</h1>
          <p className="mt-2 text-muted-foreground">Verification documents stay private and are not shown publicly.</p>
        </div>
        <Button asChild><Link to="/worker/profile/edit">{profile ? 'Edit profile' : 'Create profile'}</Link></Button>
      </div>

      {profile ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <Card><CardHeader><CardTitle>Verification</CardTitle></CardHeader><CardContent><Badge>{profile.identityVerification?.status}</Badge><Button className="mt-4 w-full" disabled={submitVerification.isPending} onClick={() => submitVerification.mutate()}>Submit for verification</Button></CardContent></Card>
          <Card><CardHeader><CardTitle>Pricing</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{displayWorkerPrice(profile)}</p></CardContent></Card>
          <Card><CardHeader><CardTitle>Roles</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">{profile.professionalRoles?.map((role) => <Badge key={role}>{workerRoleLabels[role] ?? role}</Badge>)}</CardContent></Card>
        </div>
      ) : (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No worker profile found yet.</CardContent></Card>
      )}
    </section>
  );
}
