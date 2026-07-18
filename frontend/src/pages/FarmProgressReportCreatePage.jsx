import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { useCreateFarmProgressReport } from '@/hooks/useWorkers.js';

const schema = z.object({
  title: z.string().min(4),
  summary: z.string().min(20),
  progressPercentage: z.coerce.number().min(0).max(100),
  cropHealth: z.enum(['excellent', 'good', 'average', 'poor', 'critical']),
  workCompleted: z.string().optional(),
  nextPlannedWork: z.string().optional(),
});

export function FarmProgressReportCreatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const createReport = useCreateFarmProgressReport();
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { progressPercentage: 0, cropHealth: 'good' } });

  async function onSubmit(values) {
    await createReport.mutateAsync({
      id,
      payload: {
        title: values.title,
        summary: values.summary,
        reportDate: new Date().toISOString(),
        progressPercentage: values.progressPercentage,
        cropHealth: values.cropHealth,
        workCompleted: splitLines(values.workCompleted),
        nextPlannedWork: splitLines(values.nextPlannedWork),
        photos: [],
        expenses: [],
      },
    });
    navigate(`/farm-management/${id}`);
  }

  return (
    <section className="page-shell">
      <Card className="mx-auto max-w-3xl">
        <CardHeader><CardTitle>Create farm progress report</CardTitle></CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <Field label="Report title" name="title" form={form} />
            <label className="grid gap-2 text-sm font-medium">Summary<textarea className="min-h-28 rounded-2xl border border-emerald-100 p-3" {...form.register('summary')} /></label>
            {form.formState.errors.summary ? <p className="-mt-2 text-sm text-destructive">{form.formState.errors.summary.message}</p> : null}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Progress percentage" name="progressPercentage" type="number" form={form} />
              <label className="grid gap-2 text-sm font-medium">Crop health<select className="premium-select" {...form.register('cropHealth')}><option value="excellent">Excellent</option><option value="good">Good</option><option value="average">Average</option><option value="poor">Poor</option><option value="critical">Critical</option></select></label>
            </div>
            <label className="grid gap-2 text-sm font-medium">Work completed<textarea className="min-h-24 rounded-2xl border border-emerald-100 p-3" placeholder="One item per line" {...form.register('workCompleted')} /></label>
            <label className="grid gap-2 text-sm font-medium">Next planned work<textarea className="min-h-24 rounded-2xl border border-emerald-100 p-3" placeholder="One item per line" {...form.register('nextPlannedWork')} /></label>
            <Button type="submit" disabled={createReport.isPending}>Submit report</Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

function Field({ label, name, form, type = 'text' }) {
  return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Input id={name} type={type} {...form.register(name)} />{form.formState.errors[name] ? <p className="text-sm text-destructive">{form.formState.errors[name].message}</p> : null}</div>;
}

function splitLines(value = '') {
  return String(value).split('\n').map((item) => item.trim()).filter(Boolean);
}
