import { Link, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { useJobApplicationAction, useJobApplications, useMyFarmJobs, useUpdateFarmJobStatus } from '@/hooks/useWorkers.js';
import { displayJobPay } from '@/utils/workerData.js';

export function MyFarmJobsPage() {
  const [searchParams] = useSearchParams();
  const jobsQuery = useMyFarmJobs(Object.fromEntries(searchParams.entries()));
  const updateStatus = useUpdateFarmJobStatus();
  const jobs = jobsQuery.data?.jobs ?? [];

  return (
    <section className="page-shell space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-[32px] border border-emerald-100 bg-white/90 p-6 shadow-sm sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold uppercase text-emerald-600">Hiring dashboard</p><h1 className="mt-2 text-3xl font-semibold">My farm jobs</h1></div>
        <Button asChild><Link to="/farm-jobs/new"><Plus className="h-4 w-4" />Create job</Link></Button>
      </div>
      <div className="grid gap-5">{jobs.map((job) => <JobManagementCard key={job._id} job={job} updateStatus={updateStatus} />)}</div>
    </section>
  );
}

function JobManagementCard({ job, updateStatus }) {
  const apps = useJobApplications(job._id);
  const action = useJobApplicationAction();
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-semibold">{job.title}</h3><Badge>{job.status}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{displayJobPay(job)} · {job.applicationCount} applications</p></div>
          <div className="flex flex-wrap gap-2"><Button asChild variant="outline" size="sm"><Link to={`/farm-jobs/${job.slug ?? job._id}`}>View</Link></Button>{job.status === 'open' ? <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: job._id, action: 'pause' })}>Pause</Button> : null}{job.status === 'paused' ? <Button size="sm" onClick={() => updateStatus.mutate({ id: job._id, action: 'resume' })}>Resume</Button> : null}</div>
        </div>
        <div className="grid gap-3">
          {apps.data?.applications?.map((application) => (
            <div key={application._id} className="flex flex-col justify-between gap-3 rounded-2xl border border-emerald-100 p-3 sm:flex-row sm:items-center">
              <div><p className="font-medium">{application.applicantUserId?.name}</p><p className="text-sm text-muted-foreground">{application.coverMessage}</p></div>
              <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => action.mutate({ id: application._id, action: 'shortlist' })}>Shortlist</Button><Button size="sm" onClick={() => window.confirm('Accept this applicant and create booking?') && action.mutate({ id: application._id, action: 'accept' })}>Accept</Button><Button size="sm" variant="destructive" onClick={() => action.mutate({ id: application._id, action: 'reject', payload: { reason: 'Not selected for this job.' } })}>Reject</Button></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
