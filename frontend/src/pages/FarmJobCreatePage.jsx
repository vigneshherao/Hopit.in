import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
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
  const isEdit = Boolean(id);
  const jobQuery = useFarmJob(id);
  const createJob = useCreateFarmJob();
  const updateJob = useUpdateFarmJob();
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { numberOfWorkersRequired: 1, amount: 0, status: 'open' } });

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
        <CardHeader><CardTitle>{isEdit ? 'Edit farm job' : 'Post a farm job'}</CardTitle></CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <Field label="Job title" name="title" form={form} />
            <label className="grid gap-2 text-sm font-medium">Description<textarea className="min-h-28 rounded-2xl border border-emerald-100 p-3" {...form.register('description')} /></label>
            <Field label="Required roles comma separated" name="professionalRolesRequired" form={form} />
            <Field label="Required skills comma separated" name="skillsRequired" form={form} />
            <div className="grid gap-4 sm:grid-cols-3"><Field label="City" name="city" form={form} /><Field label="District" name="district" form={form} /><Field label="State" name="state" form={form} /></div>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Daily pay" name="amount" type="number" form={form} /><Field label="Workers required" name="numberOfWorkersRequired" type="number" form={form} /></div>
            {!isEdit ? <label className="grid gap-2 text-sm font-medium">Status<select className="premium-select" {...form.register('status')}><option value="open">Publish open job</option><option value="draft">Save draft</option></select></label> : null}
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
