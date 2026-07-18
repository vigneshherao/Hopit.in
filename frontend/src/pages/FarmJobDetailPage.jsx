import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';
import { MapPin, ShieldCheck, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { useApplyToFarmJob, useFarmJob } from '@/hooks/useWorkers.js';
import { displayJobPay, workerRoleLabels, workerSkillLabels } from '@/utils/workerData.js';

export function FarmJobDetailPage() {
  const { identifier } = useParams();
  const jobQuery = useFarmJob(identifier);
  const apply = useApplyToFarmJob();
  const form = useForm({ defaultValues: { applicantType: 'individual', coverMessage: '', proposedRate: '', availabilityConfirmation: true } });
  const job = jobQuery.data?.job;

  async function onSubmit(values) {
    await apply.mutateAsync({ jobId: job._id, payload: { ...values, proposedRate: values.proposedRate ? Number(values.proposedRate) : undefined } });
  }

  if (jobQuery.isLoading) return <section className="page-shell"><div className="h-96 animate-pulse rounded-3xl bg-emerald-50" /></section>;
  if (!job) return <section className="page-shell"><Card><CardContent className="p-8 text-center">Farm job not found.</CardContent></Card></section>;

  return (
    <section className="page-shell grid gap-6 lg:grid-cols-[1fr_420px]">
      <div className="space-y-5">
        <Card><CardContent className="space-y-4 p-6"><Badge>{job.status}</Badge><h1 className="text-3xl font-semibold">{job.title}</h1><p className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-4 w-4" />{job.location?.district}, {job.location?.state}</p><p className="leading-7 text-slate-600">{job.description}</p><div className="flex flex-wrap gap-2">{job.professionalRolesRequired?.map((role) => <Badge key={role}>{workerRoleLabels[role] ?? role}</Badge>)}{job.skillsRequired?.map((skill) => <Badge key={skill} variant="outline">{workerSkillLabels[skill] ?? skill}</Badge>)}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Job details</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2"><p><Users className="mr-2 inline h-4 w-4 text-emerald-500" />{job.numberOfWorkersRequired} workers required</p><p>{displayJobPay(job)}</p><p>Accommodation: {job.schedule?.accommodationProvided ? 'Yes' : 'No'}</p><p>Food: {job.schedule?.foodProvided ? 'Yes' : 'No'}</p></CardContent></Card>
      </div>
      <Card className="h-fit lg:sticky lg:top-24">
        <CardHeader><CardTitle>Apply for this job</CardTitle></CardHeader>
        <CardContent>
          {jobQuery.data?.alreadyApplied ? <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700"><ShieldCheck className="mb-2 h-5 w-5" />You already applied to this job.</div> : (
            <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
              <label className="grid gap-2 text-sm font-medium">Applicant type<select className="premium-select" {...form.register('applicantType')}><option value="individual">Individual</option><option value="team">Team</option></select></label>
              <label className="grid gap-2 text-sm font-medium">Cover message<textarea className="min-h-28 rounded-2xl border border-emerald-100 p-3" {...form.register('coverMessage', { required: true })} /></label>
              <div><Label>Proposed rate</Label><Input type="number" {...form.register('proposedRate')} /></div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register('availabilityConfirmation')} />I confirm my availability</label>
              <Button type="submit" disabled={apply.isPending}>{apply.isPending ? 'Submitting...' : 'Submit application'}</Button>
            </form>
          )}
          <Button asChild variant="outline" className="mt-3 w-full"><Link to="/worker/profile">Check worker profile</Link></Button>
        </CardContent>
      </Card>
    </section>
  );
}
