import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { statusLabels } from '@/utils/landData.js';
import { useLand, useSubmitLandVerification, useUpdateLandStatus } from '@/hooks/useLands.js';

export function MyLandDetailPage() {
  const { id } = useParams();
  const landQuery = useLand(id);
  const submitVerification = useSubmitLandVerification();
  const updateStatus = useUpdateLandStatus();

  if (landQuery.isLoading) return <section className="page-shell">Loading listing...</section>;
  if (!landQuery.data?.land) return <section className="page-shell">Listing not found.</section>;

  const { land, applicationCount } = landQuery.data;
  const missing = getMissingChecklist(land);

  return (
    <section className="page-shell space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Badge>{statusLabels[land.status]}</Badge>
          <h1 className="mt-3 text-3xl font-bold">{land.title}</h1>
          <p className="mt-2 text-muted-foreground">{land.location.district}, {land.location.state}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline"><Link to={`/lands/${land._id}/edit`}>Edit</Link></Button>
          <Button asChild variant="outline"><Link to={`/lands/${land.slug}`}>Public view</Link></Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Views" value={land.viewCount} />
        <Metric label="Applications" value={applicationCount ?? 0} />
        <Metric label="Images" value={land.media.images.length} />
        <Metric label="Documents" value={land.documents.length} />
      </div>

      <Card>
        <CardHeader><CardTitle>Verification</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p>Land verified: {land.verification.isLandVerified ? 'Yes' : 'No'}</p>
          {land.verification.rejectionReason ? <p className="text-destructive">{land.verification.rejectionReason}</p> : null}
          {missing.length ? (
            <div>
              <p className="font-medium">Missing before submission</p>
              <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                {missing.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ) : <p className="text-sm text-muted-foreground">Submission checklist is complete.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button disabled={Boolean(missing.length)} onClick={() => submitVerification.mutate(land._id)}>Submit for verification</Button>
          <Button variant="outline" onClick={() => updateStatus.mutate({ id: land._id, action: 'pause' })}>Pause</Button>
          <Button variant="outline" onClick={() => updateStatus.mutate({ id: land._id, action: 'resume' })}>Resume</Button>
          <Button variant="outline" onClick={() => updateStatus.mutate({ id: land._id, action: 'mark-reserved' })}>Mark reserved</Button>
          <Button variant="outline" onClick={() => updateStatus.mutate({ id: land._id, action: 'mark-occupied' })}>Mark occupied</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Applications</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">Application workflow will be added in Prompt 4.</CardContent>
      </Card>
    </section>
  );
}

function Metric({ label, value }) {
  return <Card><CardHeader><CardTitle>{value ?? 0}</CardTitle><p className="text-sm text-muted-foreground">{label}</p></CardHeader></Card>;
}

function getMissingChecklist(land) {
  const missing = [];
  if (!land.media.images.length) missing.push('At least one land image');
  if (!land.documents.length) missing.push('At least one ownership or survey document');
  if (!land.transactionTypes.length) missing.push('At least one transaction type');
  if (!land.purposes.length) missing.push('At least one purpose');
  return missing;
}
