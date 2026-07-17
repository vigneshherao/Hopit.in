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
    <section className="page-shell space-y-6">
      <h1 className="text-3xl font-bold">Received applications</h1>
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
