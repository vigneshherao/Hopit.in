import { Link, useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { applicationStatusLabels, applicationTypeLabels } from '@/constants/application.js';
import { useApplicationStatistics, useMyApplications, useSubmitApplication, useWithdrawApplication } from '@/hooks/useApplications.js';

export function MyApplicationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = Object.fromEntries(searchParams.entries());
  const apps = useMyApplications(filters);
  const stats = useApplicationStatistics();
  const submit = useSubmitApplication();
  const withdraw = useWithdrawApplication();

  function setStatus(status) {
    const next = new URLSearchParams(searchParams);
    if (status) next.set('status', status);
    else next.delete('status');
    setSearchParams(next);
  }

  return (
    <section className="page-shell space-y-7">
      <div className="rounded-[32px] border border-emerald-100 bg-white/86 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur">
        <p className="text-sm font-semibold uppercase text-emerald-600">Applicant workspace</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">My applications</h1>
        <p className="mt-2 text-muted-foreground">Track proposals, negotiations, selections, and agreement preparation.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {['total', 'submitted', 'shortlisted', 'accepted'].map((key) => (
          <Card key={key}><CardHeader><CardTitle>{stats.data?.statistics?.[key] ?? 0}</CardTitle><p className="text-sm text-muted-foreground">{key}</p></CardHeader></Card>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 rounded-3xl border border-emerald-100 bg-white/80 p-3 shadow-sm">
        {['', 'draft', 'submitted', 'under-review', 'shortlisted', 'changes-requested', 'agreement-pending'].map((status) => (
          <Button key={status || 'all'} variant={(filters.status ?? '') === status ? 'default' : 'outline'} onClick={() => setStatus(status)}>
            {status ? applicationStatusLabels[status] : 'All'}
          </Button>
        ))}
      </div>
      <div className="grid gap-4">
        {apps.data?.applications?.map((application) => (
          <ApplicationRow key={application._id} application={application} submit={submit.mutate} withdraw={withdraw.mutate} />
        ))}
      </div>
    </section>
  );
}

function ApplicationRow({ application, submit, withdraw }) {
  const land = application.landId;
  return (
    <Card>
      <CardContent className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{application.proposal.title}</h3>
            <Badge>{applicationStatusLabels[application.status]}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{land?.title} · {applicationTypeLabels[application.applicationType]} · Round {application.negotiation?.currentRound ?? 0}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm"><Link to={`/my-applications/${application._id}`}>View</Link></Button>
          {application.status === 'draft' ? <Button size="sm" onClick={() => submit(application._id)}>Submit</Button> : null}
          {['submitted', 'under-review', 'shortlisted', 'changes-requested'].includes(application.status) ? <Button size="sm" variant="outline" onClick={() => withdraw(application._id)}>Withdraw</Button> : null}
        </div>
      </CardContent>
    </Card>
  );
}
