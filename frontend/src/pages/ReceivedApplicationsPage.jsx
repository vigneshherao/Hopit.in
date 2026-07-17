import { Link, useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { applicationStatusLabels, applicationTypeLabels } from '@/constants/application.js';
import { useReceivedApplications, useReviewApplication, useShortlistApplication } from '@/hooks/useApplications.js';

export function ReceivedApplicationsPage() {
  const [searchParams] = useSearchParams();
  const filters = Object.fromEntries(searchParams.entries());
  const apps = useReceivedApplications(filters);
  const review = useReviewApplication();
  const shortlist = useShortlistApplication();

  return (
    <section className="page-shell space-y-7">
      <div className="rounded-[32px] border border-emerald-100 bg-white/86 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur">
        <p className="text-sm font-semibold uppercase text-emerald-600">Owner inbox</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">Received applications</h1>
        <p className="mt-2 text-muted-foreground">Review proposals, shortlist applicants, and move selected deals toward agreements.</p>
      </div>
      <div className="grid gap-4">
        {apps.data?.applications?.map((application) => (
          <Card key={application._id}>
            <CardContent className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="flex flex-wrap gap-2">
                  <h3 className="font-semibold">{application.applicantId?.name}</h3>
                  <Badge>{applicationStatusLabels[application.status]}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{application.landId?.title} · {applicationTypeLabels[application.applicationType]} · {application.proposal.title}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm"><Link to={`/received-applications/${application._id}`}>Open</Link></Button>
                {application.status === 'submitted' ? <Button size="sm" onClick={() => review.mutate(application._id)}>Review</Button> : null}
                {['submitted', 'under-review'].includes(application.status) ? <Button size="sm" variant="outline" onClick={() => shortlist.mutate(application._id)}>Shortlist</Button> : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
