import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { useCreateFarmJob, useFarmJob, useUpdateFarmJob } from '@/hooks/useWorkers.js';

const schema = z.object({
  title: z.string().min(4),
  description: z.string().min(20),
  professionalRolesRequired: z.string().min(1),
  skillsRequired: z.string().optional(),
  city: z.string().min(1),
  district: z.string().min(1),
  state: z.string().min(1),
  amount: z.coerce.number().min(0),
  numberOfWorkersRequired: z.coerce.number().min(1),
  status: z.enum(['draft', 'open']),
});

export function FarmJobCreatePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const selectedWorkerName = searchParams.get('workerName');
  const selectedWorkerRole = searchParams.get('role') ?? '';
  const selectedWorkerSkills = searchParams.get('skills') ?? '';
  const selectedWorkerCity = searchParams.get('city') ?? '';
  const selectedWorkerDistrict = searchParams.get('district') ?? '';
  const selectedWorkerState = searchParams.get('state') ?? '';
  const selectedWorkerAmount = Number(searchParams.get('amount')) || 0;
  const isInviteMode = searchParams.get('mode') === 'invite';
  const jobQuery = useFarmJob(id);
  const createJob = useCreateFarmJob();
  const updateJob = useUpdateFarmJob();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: selectedWorkerName ? `Hire ${selectedWorkerName} for farm work` : '',
      description: selectedWorkerName
        ? `We want to invite ${selectedWorkerName} for agricultural work. Please review the farm requirements, schedule, and payment before accepting.`
        : '',
      professionalRolesRequired: selectedWorkerRole,
      skillsRequired: selectedWorkerSkills,
      city: selectedWorkerCity,
      district: selectedWorkerDistrict,
      state: selectedWorkerState,
      numberOfWorkersRequired: 1,
      amount: selectedWorkerAmount,
      status: 'open',
    },
  });

  useEffect(() => {
    const job = jobQuery.data?.job;
    if (!job || !isEdit) return;
    form.reset({
      title: job.title ?? '',
      description: job.description ?? '',
      professionalRolesRequired: job.professionalRolesRequired?.join(', ') ?? '',
      skillsRequired: job.skillsRequired?.join(', ') ?? '',
      city: job.location?.city ?? '',
      district: job.location?.district ?? '',
      state: job.location?.state ?? '',
      amount: job.compensation?.amount ?? 0,
      numberOfWorkersRequired: job.numberOfWorkersRequired ?? 1,
      status: job.status === 'draft' ? 'draft' : 'open',
    });
  }, [form, isEdit, jobQuery.data?.job]);

  async function onSubmit(values) {
    const payload = {
      title: values.title,
      description: values.description,
      professionalRolesRequired: splitValues(values.professionalRolesRequired),
      skillsRequired: splitValues(values.skillsRequired),
      workType: 'daily',
      hiringType: 'individual',
      numberOfWorkersRequired: values.numberOfWorkersRequired,
      duration: { startDate: new Date().toISOString(), flexible: true },
      schedule: { workingDays: [], accommodationProvided: false, foodProvided: false, transportProvided: false },
      location: { city: values.city, district: values.district, state: values.state },
      responsibilities: [],
      requirements: [],
      compensation: { paymentType: 'daily', amount: values.amount, currency: 'INR' },
    };
    if (isEdit) {
      const result = await updateJob.mutateAsync({ id, payload });
      navigate(`/farm-jobs/${result.job.slug ?? result.job._id}`);
      return;
    }
    const result = await createJob.mutateAsync({ ...payload, status: values.status });
    navigate(`/farm-jobs/${result.job.slug ?? result.job._id}`);
  }

  return (
    <section className="page-shell">
      <Card className="mx-auto max-w-3xl">
        <CardHeader><CardTitle>{isEdit ? 'Edit farm job' : isInviteMode ? 'Invite worker to a job' : 'Post a farm job'}</CardTitle></CardHeader>
        <CardContent>
          {selectedWorkerName ? (
            <div className="mb-5 rounded-3xl border border-emerald-100 bg-emerald-50/80 p-4 text-sm text-emerald-950">
              <p className="font-semibold">{isInviteMode ? 'Worker invite draft' : 'Hiring draft'} for {selectedWorkerName}</p>
              <p className="mt-1 text-emerald-700">
                The worker role, skills, location, and visible rate were added to this job. Publishing creates the job so the worker workflow can continue through applications and booking confirmation.
              </p>
            </div>
          ) : null}
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <Field label="Job title" name="title" form={form} />
            <label className="grid gap-2 text-sm font-medium">Description<textarea className="min-h-28 rounded-2xl border border-emerald-100 p-3" {...form.register('description')} /></label>
            <Field label="Required roles comma separated" name="professionalRolesRequired" form={form} />
            <Field label="Required skills comma separated" name="skillsRequired" form={form} />
            <div className="grid gap-4 sm:grid-cols-3"><Field label="City" name="city" form={form} /><Field label="District" name="district" form={form} /><Field label="State" name="state" form={form} /></div>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Daily pay" name="amount" type="number" form={form} /><Field label="Workers required" name="numberOfWorkersRequired" type="number" form={form} /></div>
            {!isEdit ? <label className="grid gap-2 text-sm font-medium">Status<select className="premium-select" {...form.register('status')}><option value="open">Publish open job</option><option value="draft">Save draft</option></select></label> : null}
            {createJob.error || updateJob.error ? (
              <p className="rounded-2xl border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-700">
                {createJob.error?.response?.data?.message ?? updateJob.error?.response?.data?.message ?? createJob.error?.message ?? updateJob.error?.message}
              </p>
            ) : null}
            <Button type="submit" disabled={createJob.isPending || updateJob.isPending}>{isEdit ? 'Update farm job' : 'Save farm job'}</Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

function Field({ label, name, form, type = 'text' }) {
  return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Input id={name} type={type} {...form.register(name)} />{form.formState.errors[name] ? <p className="text-sm text-destructive">{form.formState.errors[name].message}</p> : null}</div>;
}

function splitValues(value = '') {
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
}
