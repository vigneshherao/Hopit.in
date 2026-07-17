import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { applicationTypeLabels, compatibleApplicationTypes } from '@/constants/application.js';
import { useAuth } from '@/context/AuthContext.jsx';
import { useCreateApplication } from '@/hooks/useApplications.js';
import { useLand } from '@/hooks/useLands.js';
import { getApiErrorMessage } from '@/utils/authErrors.js';

const schema = z.object({
  applicationType: z.string().min(1),
  occupation: z.string().optional(),
  currentLocation: z.string().optional(),
  farmingExperience: z.string().optional(),
  businessExperience: z.string().optional(),
  title: z.string().min(3, 'Proposal title is required.'),
  summary: z.string().min(10, 'Summary must be at least 10 characters.'),
  intendedUse: z.string().min(3, 'Intended use is required.'),
  proposedDurationMonths: z.coerce.number().optional(),
  proposedMonthlyRent: z.coerce.number().optional(),
  proposedAnnualLeaseAmount: z.coerce.number().optional(),
  proposedPurchasePrice: z.coerce.number().optional(),
  proposedOwnerRevenuePercentage: z.coerce.number().optional(),
  proposedApplicantRevenuePercentage: z.coerce.number().optional(),
  expectedInvestment: z.coerce.number().optional(),
  coverMessage: z.string().optional(),
});

export function LandApplyPage() {
  const { identifier } = useParams();
  const { user } = useAuth();
  const landQuery = useLand(identifier);
  const createApplication = useCreateApplication();
  const navigate = useNavigate();
  const land = landQuery.data?.land;
  const types = useMemo(() => compatibleApplicationTypes(land), [land]);
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { applicationType: types[0] ?? 'lease' } });

  useEffect(() => {
    if (types[0]) form.setValue('applicationType', types[0]);
  }, [types, form]);

  if (landQuery.isLoading) return <section className="page-shell">Loading land...</section>;
  if (!land) return <section className="page-shell">Land not found.</section>;
  if (String(land.ownerId?._id ?? land.ownerId) === user?.id) {
    return <section className="page-shell">You cannot apply to your own land.</section>;
  }

  async function submit(values, saveAsDraft) {
    try {
      const result = await createApplication.mutateAsync({
        landId: land._id,
        applicationType: values.applicationType,
        applicantProfile: {
          occupation: values.occupation,
          currentLocation: values.currentLocation,
          farmingExperience: values.farmingExperience,
          businessExperience: values.businessExperience,
        },
        proposal: {
          title: values.title,
          summary: values.summary,
          intendedUse: values.intendedUse,
          proposedDurationMonths: values.proposedDurationMonths,
          proposedMonthlyRent: values.proposedMonthlyRent,
          proposedAnnualLeaseAmount: values.proposedAnnualLeaseAmount,
          proposedPurchasePrice: values.proposedPurchasePrice,
          proposedOwnerRevenuePercentage: values.proposedOwnerRevenuePercentage,
          proposedApplicantRevenuePercentage: values.proposedApplicantRevenuePercentage,
          expectedInvestment: values.expectedInvestment,
          ownerParticipationRequested: false,
        },
        coverMessage: values.coverMessage,
        saveAsDraft,
      });
      navigate(`/my-applications/${result.application._id}`, { replace: true });
    } catch (error) {
      window.alert(getApiErrorMessage(error, 'Unable to create application.'));
    }
  }

  return (
    <section className="page-shell">
      <Card>
        <CardHeader>
          <CardTitle>Apply for {land.title}</CardTitle>
          <CardDescription>{land.location.district}, {land.location.state}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" noValidate>
            <Field label="Application type">
              <select className="h-10 rounded-md border bg-background px-3" {...form.register('applicationType')}>
                {types.map((type) => <option key={type} value={type}>{applicationTypeLabels[type]}</option>)}
              </select>
            </Field>
            <Field label="Occupation"><Input {...form.register('occupation')} /></Field>
            <Field label="Current location"><Input {...form.register('currentLocation')} /></Field>
            <Field label="Proposal title" error={form.formState.errors.title?.message}><Input {...form.register('title')} /></Field>
            <Field label="Summary" error={form.formState.errors.summary?.message}><Input {...form.register('summary')} /></Field>
            <Field label="Intended use" error={form.formState.errors.intendedUse?.message}><Input {...form.register('intendedUse')} /></Field>
            <Field label="Duration months"><Input type="number" {...form.register('proposedDurationMonths')} /></Field>
            <Field label="Monthly rent"><Input type="number" {...form.register('proposedMonthlyRent')} /></Field>
            <Field label="Annual lease"><Input type="number" {...form.register('proposedAnnualLeaseAmount')} /></Field>
            <Field label="Purchase offer"><Input type="number" {...form.register('proposedPurchasePrice')} /></Field>
            <Field label="Expected investment"><Input type="number" {...form.register('expectedInvestment')} /></Field>
            <Field label="Cover message"><Input {...form.register('coverMessage')} /></Field>
            <p className="md:col-span-2 text-sm text-muted-foreground">
              This application is a proposal only. Final agreements require legal review and applicable registration.
            </p>
            <div className="md:col-span-2 flex gap-3">
              <Button type="button" variant="outline" onClick={form.handleSubmit((values) => submit(values, true))}>Save draft</Button>
              <Button type="button" onClick={form.handleSubmit((values) => submit(values, false))}>Submit application</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

function Field({ label, error, children }) {
  return <label className="grid gap-2 text-sm"><Label>{label}</Label>{children}{error ? <span className="text-destructive">{error}</span> : null}</label>;
}
