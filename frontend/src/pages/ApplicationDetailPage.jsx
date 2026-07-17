import { Link, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { NegotiationTimeline } from '@/components/applications/NegotiationTimeline.jsx';
import { applicationStatusLabels, applicationTypeLabels } from '@/constants/application.js';
import {
  useAcceptApplication,
  useAcceptNegotiatedTerms,
  useApplication,
  useNegotiateApplication,
  useRejectApplication,
  useRequestApplicationChanges,
  useReviewApplication,
  useShortlistApplication,
  useWithdrawApplication,
} from '@/hooks/useApplications.js';

export function ApplicationDetailPage() {
  const { id } = useParams();
  const query = useApplication(id);
  const review = useReviewApplication();
  const shortlist = useShortlistApplication();
  const reject = useRejectApplication();
  const requestChanges = useRequestApplicationChanges();
  const negotiate = useNegotiateApplication();
  const acceptTerms = useAcceptNegotiatedTerms();
  const acceptApplication = useAcceptApplication();
  const withdraw = useWithdrawApplication();

  if (query.isLoading) return <section className="page-shell">Loading application...</section>;
  if (!query.data?.application) return <section className="page-shell">Application not found.</section>;
  const { application, negotiations, agreement, allowedActions } = query.data;

  return (
    <section className="page-shell space-y-6">
      <div>
        <Badge>{applicationStatusLabels[application.status]}</Badge>
        <h1 className="mt-3 text-3xl font-bold">{application.proposal.title}</h1>
        <p className="mt-2 text-muted-foreground">{applicationTypeLabels[application.applicationType]} · {application.landId?.title}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Proposal</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>{application.proposal.summary}</p>
            <p><span className="text-muted-foreground">Use:</span> {application.proposal.intendedUse}</p>
            <p><span className="text-muted-foreground">Duration:</span> {application.proposal.proposedDurationMonths ?? '-'} months</p>
            <p><span className="text-muted-foreground">Investment:</span> {money(application.proposal.expectedInvestment)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            {allowedActions.includes('review') ? <Button onClick={() => review.mutate(id)}>Mark under review</Button> : null}
            {allowedActions.includes('shortlist') ? <Button onClick={() => shortlist.mutate(id)}>Shortlist</Button> : null}
            {allowedActions.includes('withdraw') ? <Button variant="outline" onClick={() => withdraw.mutate(id)}>Withdraw</Button> : null}
            {allowedActions.includes('request-changes') ? <Button variant="outline" onClick={() => requestChanges.mutate({ id, message: window.prompt('Change request message') || 'Please update your proposal.' })}>Request changes</Button> : null}
            {allowedActions.includes('reject') ? <Button variant="destructive" onClick={() => reject.mutate({ id, reason: window.prompt('Reason') || 'Not suitable right now.' })}>Reject</Button> : null}
            {allowedActions.includes('accept-application') ? <Button onClick={() => window.confirm('Land will be reserved, other applications closed, and a draft agreement generated.') && acceptApplication.mutate(id)}>Accept application</Button> : null}
            {agreement?._id ? <Button asChild variant="outline"><Link to={`/agreements/${agreement._id}`}>View agreement</Link></Button> : null}
          </CardContent>
        </Card>
      </div>

      <NegotiationTimeline
        negotiations={negotiations}
        canAccept={allowedActions.includes('accept-terms')}
        onAccept={() => acceptTerms.mutate(id)}
        onCounter={(payload) => negotiate.mutate({ id, payload })}
      />
    </section>
  );
}

function money(value) {
  return value ? `₹${Number(value).toLocaleString('en-IN')}` : '-';
}
