import { useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { agreementDisclaimer } from '@/utils/applicationData.js';
import { useAgreement, useConfirmAgreement, useRequestAgreementChanges } from '@/hooks/useApplications.js';

export function AgreementPage() {
  const { id } = useParams();
  const agreementQuery = useAgreement(id);
  const confirm = useConfirmAgreement();
  const requestChanges = useRequestAgreementChanges();

  if (agreementQuery.isLoading) return <section className="page-shell">Loading agreement...</section>;
  const agreement = agreementQuery.data?.agreement;
  if (!agreement) return <section className="page-shell">Agreement not found.</section>;

  return (
    <section className="page-shell space-y-6">
      <div>
        <Badge>Draft agreement</Badge>
        <h1 className="mt-3 text-3xl font-bold">{agreement.terms.landTitle}</h1>
        <p className="mt-2 text-muted-foreground">Version {agreement.version} · {agreement.status}</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Terms</CardTitle></CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <p>Location: {agreement.terms.landLocation}</p>
          <p>Area: {agreement.terms.landAreaValue} {agreement.terms.landAreaUnit}</p>
          <p>Duration: {agreement.terms.durationMonths ?? '-'} months</p>
          <p>Monthly rent: {money(agreement.terms.monthlyRent)}</p>
          <p>Annual lease: {money(agreement.terms.annualLeaseAmount)}</p>
          <p>Purchase price: {money(agreement.terms.purchasePrice)}</p>
          <p>Revenue split: {agreement.terms.ownerRevenuePercentage ?? '-'} / {agreement.terms.applicantRevenuePercentage ?? '-'}</p>
          <p>Owner participation: {agreement.terms.ownerParticipation ? 'Yes' : 'No'}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Generated summary</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{agreement.generatedSummary}</p>
          <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            {agreement.legalDisclaimer || agreementDisclaimer}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => confirm.mutate(id)}>Confirm draft</Button>
            <Button variant="outline" onClick={() => requestChanges.mutate({ id, message: window.prompt('Requested changes') || 'Please revise the draft.' })}>Request changes</Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function money(value) {
  return value ? `₹${Number(value).toLocaleString('en-IN')}` : '-';
}
