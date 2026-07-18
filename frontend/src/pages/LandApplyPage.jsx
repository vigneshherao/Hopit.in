import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { applicationTypeLabels, compatibleApplicationTypes } from '@/utils/applicationData.js';
import { useAuth } from '@/context/AuthContext.jsx';
import { useCreateApplication } from '@/hooks/useApplications.js';
import { useLand } from '@/hooks/useLands.js';
import { getApiErrorMessage } from '@/utils/authErrors.js';

const optionalNumber = z.preprocess(
  (value) => (value === '' || value === null || Number.isNaN(value) ? undefined : value),
  z.coerce.number().optional(),
);

const schema = z.object({
  applicationType: z.string().min(1),
  occupation: z.string().optional(),
  currentLocation: z.string().optional(),
  farmingExperience: z.string().optional(),
  businessExperience: z.string().optional(),
  title: z.string().min(3, 'Proposal title is required.'),
  summary: z.string().min(10, 'Summary must be at least 10 characters.'),
  intendedUse: z.string().min(3, 'Intended use is required.'),
  proposedDurationMonths: optionalNumber,
  proposedMonthlyRent: optionalNumber,
  proposedAnnualLeaseAmount: optionalNumber,
  proposedPurchasePrice: optionalNumber,
  proposedOwnerRevenuePercentage: optionalNumber,
  proposedApplicantRevenuePercentage: optionalNumber,
  expectedInvestment: optionalNumber,
  coverMessage: z.string().optional(),
}).superRefine((values, ctx) => {
  if (values.applicationType === 'lease') {
    if (!values.proposedDurationMonths) ctx.addIssue({ code: 'custom', path: ['proposedDurationMonths'], message: 'Duration is required for lease.' });
    if (!values.proposedAnnualLeaseAmount) ctx.addIssue({ code: 'custom', path: ['proposedAnnualLeaseAmount'], message: 'Annual lease amount is required.' });
  }
  if (values.applicationType === 'rent') {
    if (!values.proposedDurationMonths) ctx.addIssue({ code: 'custom', path: ['proposedDurationMonths'], message: 'Duration is required for rent.' });
    if (!values.proposedMonthlyRent) ctx.addIssue({ code: 'custom', path: ['proposedMonthlyRent'], message: 'Monthly rent is required.' });
  }
  if (values.applicationType === 'revenue-share') {
    if (values.proposedOwnerRevenuePercentage === undefined) {
      ctx.addIssue({ code: 'custom', path: ['proposedOwnerRevenuePercentage'], message: 'Owner revenue share is required.' });
    }
    if (values.proposedApplicantRevenuePercentage === undefined) {
      ctx.addIssue({ code: 'custom', path: ['proposedApplicantRevenuePercentage'], message: 'Applicant revenue share is required.' });
    }
    if (
      values.proposedOwnerRevenuePercentage !== undefined &&
      values.proposedApplicantRevenuePercentage !== undefined &&
      values.proposedOwnerRevenuePercentage + values.proposedApplicantRevenuePercentage !== 100
    ) {
      ctx.addIssue({ code: 'custom', path: ['proposedOwnerRevenuePercentage'], message: 'Revenue shares must total 100.' });
    }
  }
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
  const selectedApplicationType = form.watch('applicationType');

  useEffect(() => {
    if (types[0]) form.setValue('applicationType', types[0]);
  }, [types, form]);

  if (landQuery.isLoading) return <section className="page-shell">Loading land...</section>;
  if (!land) return <section className="page-shell">Land not found.</section>;
  if (String(land.ownerId?._id ?? land.ownerId) === user?.id) {
    return <section className="page-shell">You cannot apply to your own land.</section>;
  }
  const isWorker = user?.role === 'worker';

  async function submit(values, saveAsDraft) {
    try {
      const proposal = {
        title: values.title,
        summary: values.summary,
        intendedUse: values.intendedUse,
        ownerParticipationRequested: false,
      };

      if (['lease', 'rent', 'joint-venture', 'revenue-share'].includes(values.applicationType)) {
        proposal.proposedDurationMonths = values.proposedDurationMonths;
      }
      if (values.applicationType === 'rent') proposal.proposedMonthlyRent = values.proposedMonthlyRent;
      if (values.applicationType === 'lease') proposal.proposedAnnualLeaseAmount = values.proposedAnnualLeaseAmount;
      if (values.applicationType === 'sale-enquiry') proposal.proposedPurchasePrice = values.proposedPurchasePrice;
      if (values.applicationType === 'revenue-share') {
        proposal.proposedOwnerRevenuePercentage = values.proposedOwnerRevenuePercentage;
        proposal.proposedApplicantRevenuePercentage = values.proposedApplicantRevenuePercentage;
      }
      if (['joint-venture', 'revenue-share', 'business-proposal'].includes(values.applicationType)) {
        proposal.expectedInvestment = values.expectedInvestment;
      }

      const result = await createApplication.mutateAsync({
        landId: land._id,
        applicationType: values.applicationType,
        applicantProfile: {
          occupation: values.occupation,
          currentLocation: values.currentLocation,
          farmingExperience: values.farmingExperience,
          businessExperience: values.businessExperience,
        },
        proposal,
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
          <CardTitle>{isWorker ? 'Submit work interest' : 'Apply'} for {land.title}</CardTitle>
          <CardDescription>
            {isWorker
              ? `Tell the owner how your skills fit this land in ${land.location.district}, ${land.location.state}.`
              : `${land.location.district}, ${land.location.state}`}
          </CardDescription>
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
            <Field label={isWorker ? 'Work interest title' : 'Proposal title'} error={form.formState.errors.title?.message}><Input {...form.register('title')} /></Field>
            <Field label={isWorker ? 'Your skill fit summary' : 'Summary'} error={form.formState.errors.summary?.message}><Input {...form.register('summary')} /></Field>
            <Field label={isWorker ? 'Work you can support' : 'Intended use'} error={form.formState.errors.intendedUse?.message}><Input {...form.register('intendedUse')} /></Field>
            {['lease', 'rent', 'joint-venture', 'revenue-share'].includes(selectedApplicationType) ? (
              <Field label="Duration months" error={form.formState.errors.proposedDurationMonths?.message}><Input type="number" {...form.register('proposedDurationMonths')} /></Field>
            ) : null}
            {selectedApplicationType === 'rent' ? (
              <Field label="Monthly rent" error={form.formState.errors.proposedMonthlyRent?.message}><Input type="number" {...form.register('proposedMonthlyRent')} /></Field>
            ) : null}
            {selectedApplicationType === 'lease' ? (
              <Field label="Annual lease" error={form.formState.errors.proposedAnnualLeaseAmount?.message}><Input type="number" {...form.register('proposedAnnualLeaseAmount')} /></Field>
            ) : null}
            {selectedApplicationType === 'sale-enquiry' ? (
              <Field label="Purchase offer" error={form.formState.errors.proposedPurchasePrice?.message}><Input type="number" {...form.register('proposedPurchasePrice')} /></Field>
            ) : null}
            {selectedApplicationType === 'revenue-share' ? (
              <>
                <Field label="Owner revenue %" error={form.formState.errors.proposedOwnerRevenuePercentage?.message}><Input type="number" min="0" max="100" {...form.register('proposedOwnerRevenuePercentage')} /></Field>
                <Field label="Applicant revenue %" error={form.formState.errors.proposedApplicantRevenuePercentage?.message}><Input type="number" min="0" max="100" {...form.register('proposedApplicantRevenuePercentage')} /></Field>
              </>
            ) : null}
            {['joint-venture', 'revenue-share', 'business-proposal'].includes(selectedApplicationType) ? (
              <Field label="Expected investment"><Input type="number" {...form.register('expectedInvestment')} /></Field>
            ) : null}
            <Field label="Cover message"><Input {...form.register('coverMessage')} /></Field>
            <p className="md:col-span-2 text-sm text-muted-foreground">
              {isWorker
                ? 'This is a work-interest proposal. The owner can review your profile and continue discussion before assigning any work.'
                : 'This application is a proposal only. Final agreements require legal review and applicable registration.'}
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
