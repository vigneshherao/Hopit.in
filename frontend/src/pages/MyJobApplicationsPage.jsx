import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { useJobApplicationAction, useMyJobApplications } from '@/hooks/useWorkers.js';

export function MyJobApplicationsPage() {
  const appsQuery = useMyJobApplications();
  const action = useJobApplicationAction();
  const applications = appsQuery.data?.applications ?? [];
  return (
    <section className="page-shell space-y-6">
      <div className="rounded-[32px] border border-emerald-100 bg-white/90 p-6 shadow-sm"><p className="text-sm font-semibold uppercase text-emerald-600">Worker applications</p><h1 className="mt-2 text-3xl font-semibold">My job applications</h1></div>
      <div className="grid gap-4">{applications.map((application) => <Card key={application._id}><CardContent className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center"><div><div className="flex flex-wrap gap-2"><h3 className="font-semibold">{application.jobId?.title}</h3><Badge>{application.status}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{application.coverMessage}</p></div><div className="flex flex-wrap gap-2"><Button asChild variant="outline" size="sm"><Link to={`/farm-jobs/${application.jobId?.slug ?? application.jobId?._id}`}>Job</Link></Button>{['submitted', 'under-review', 'shortlisted'].includes(application.status) ? <Button size="sm" variant="outline" onClick={() => action.mutate({ id: application._id, action: 'withdraw' })}>Withdraw</Button> : null}</div></CardContent></Card>)}</div>
    </section>
  );
}
