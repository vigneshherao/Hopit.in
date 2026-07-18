import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Loader2, Plus, Sprout } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { useFarmPlans, useGeneratePlan } from '@/hooks/useFarmPlanner.js';
import { useMyLands } from '@/hooks/useLands.js';
import { formatCurrency, labelize, riskTone } from '@/utils/farmPlannerData.js';

const schema = z.object({
  landId: z.string().min(1, 'Select a land.'),
  selectedCrop: z.string().trim().min(2, 'Crop is required.'),
  selectedSeason: z.string().trim().min(2, 'Season is required.'),
  budget: z.coerce.number().min(0).optional(),
  area: z.coerce.number().positive().optional(),
  startDate: z.string().min(1, 'Start date is required.'),
  notes: z.string().optional(),
});

export function FarmPlannerPage() {
  const navigate = useNavigate();
  const plansQuery = useFarmPlans({ limit: 20 });
  const landsQuery = useMyLands({ limit: 50 });
  const generatePlan = useGeneratePlan();
  const lands = landsQuery.data?.lands ?? [];
  const plans = plansQuery.data?.plans ?? [];
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { selectedSeason: 'monsoon', startDate: new Date().toISOString().slice(0, 10), budget: 100000 } });

  async function onSubmit(values) {
    const result = await generatePlan.mutateAsync({ ...values, startDate: new Date(values.startDate).toISOString() });
    navigate(`/farm-planner/${result.plan._id}`);
  }

  return (
    <section className="page-shell space-y-7">
      <div className="relative overflow-hidden rounded-[36px] border border-emerald-100 bg-white p-7 shadow-xl shadow-emerald-900/5">
        <div className="absolute right-8 top-8 h-32 w-32 rounded-full bg-purple-200/40 blur-3xl" />
        <p className="text-sm font-semibold uppercase text-emerald-600">Farm Planner</p>
        <h1 className="mt-2 max-w-3xl text-4xl font-semibold text-slate-950">Convert crop recommendations into a farming execution plan.</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">Generate preparation, seed, water, fertilizer, worker, equipment, timeline, harvest, and profit plans for a selected Hopt It land.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-emerald-600" /> Generate AI farm plan</CardTitle></CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <label className="grid gap-2 text-sm font-medium">Land<select className="premium-select" {...form.register('landId')}><option value="">Select land</option>{lands.map((land) => <option key={land._id} value={land._id}>{land.title} · {land.location?.district}</option>)}</select>{form.formState.errors.landId ? <span className="text-sm text-destructive">{form.formState.errors.landId.message}</span> : null}</label>
              <div className="grid gap-4 sm:grid-cols-2"><Field label="Crop" name="selectedCrop" form={form} /><Field label="Season" name="selectedSeason" form={form} /></div>
              <div className="grid gap-4 sm:grid-cols-2"><Field label="Budget" name="budget" type="number" form={form} /><Field label="Area override" name="area" type="number" form={form} /></div>
              <Field label="Start date" name="startDate" type="date" form={form} />
              <label className="grid gap-2 text-sm font-medium">Notes<textarea className="min-h-24 rounded-2xl border border-emerald-100 p-3" {...form.register('notes')} /></label>
              {generatePlan.error ? <p className="rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">{generatePlan.error.response?.data?.message ?? generatePlan.error.message}</p> : null}
              {generatePlan.isPending ? <PlanningLoader /> : null}
              <Button type="submit" disabled={generatePlan.isPending} className="w-full">{generatePlan.isPending ? 'Generating...' : 'Generate plan'}</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3"><h2 className="text-2xl font-semibold text-slate-950">Your farm plans</h2><Badge variant="secondary">{plans.length} plans</Badge></div>
          {plansQuery.isLoading ? <div className="h-72 animate-pulse rounded-3xl bg-emerald-50" /> : null}
          <div className="grid gap-4">
            {plans.map((plan) => <PlanCard key={plan._id} plan={plan} />)}
          </div>
          {!plansQuery.isLoading && !plans.length ? <Card><CardContent className="p-8 text-center text-muted-foreground">No farm plans yet. Generate your first plan from a selected land and crop.</CardContent></Card> : null}
        </div>
      </div>
    </section>
  );
}

function PlanCard({ plan }) {
  return (
    <Card>
      <CardContent className="flex flex-col justify-between gap-4 p-5 lg:flex-row lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-semibold text-slate-950">{plan.planTitle}</h3><Badge>{labelize(plan.status)}</Badge><span className={`rounded-full px-3 py-1 text-xs font-semibold ${riskTone(plan.riskLevel)}`}>{labelize(plan.riskLevel)} risk</span></div>
          <p className="mt-1 text-sm text-muted-foreground">{plan.selectedCrop} · {plan.landId?.title ?? 'Land'} · {plan.farmDurationDays} days</p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm"><span>{formatCurrency(plan.estimatedInvestment)} investment</span><span>{formatCurrency(plan.estimatedProfit)} profit</span><span>{plan.expectedROI}% ROI</span></div>
        </div>
        <Button asChild variant="outline"><Link to={`/farm-planner/${plan._id}`}>Open dashboard</Link></Button>
      </CardContent>
    </Card>
  );
}

function PlanningLoader() {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 rounded-3xl bg-purple-50 p-4 text-purple-900"><div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white"><div className="absolute inset-0 animate-ping rounded-full bg-emerald-300/50" /><Sprout className="relative h-6 w-6 text-emerald-600" /></div><div><p className="font-semibold">Building execution timeline</p><p className="text-sm text-purple-700">Estimating workers, equipment, inputs, harvest, and returns.</p></div><Loader2 className="ml-auto h-5 w-5 animate-spin" /></motion.div>;
}

function Field({ label, name, form, type = 'text' }) {
  return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Input id={name} type={type} {...form.register(name)} />{form.formState.errors[name] ? <p className="text-sm text-destructive">{form.formState.errors[name].message}</p> : null}</div>;
}
