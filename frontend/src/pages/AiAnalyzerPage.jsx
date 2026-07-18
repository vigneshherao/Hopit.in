import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Brain, Loader2, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { useAnalyzeLand } from '@/hooks/useAI.js';
import { useMyLands } from '@/hooks/useLands.js';
import { analysisStages, areaUnits, experienceLevels, farmingTypes, labelize, seasons, soilTypes, waterAvailabilityOptions } from '@/utils/aiData.js';

const schema = z.object({
  landId: z.string().optional(),
  soilType: z.string().optional(),
  landArea: z.coerce.number().optional(),
  areaUnit: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  season: z.string().min(1, 'Season is required.'),
  temperature: z.coerce.number().min(-20).max(60).optional(),
  rainfall: z.coerce.number().min(0).optional(),
  waterAvailability: z.string().min(1, 'Water availability is required.'),
  irrigationAvailable: z.boolean().default(false),
  budget: z.coerce.number().min(0, 'Budget must be positive.'),
  farmingExperience: z.string().min(1, 'Experience is required.'),
  preferredFarmingType: z.string().min(1, 'Farming type is required.'),
  preferredCrops: z.string().optional(),
  marketDistanceKm: z.coerce.number().min(0).optional(),
  roadAccess: z.boolean().default(false),
  ownerParticipation: z.boolean().default(false),
}).superRefine((data, ctx) => {
  if (data.landId) return;
  for (const field of ['soilType', 'landArea', 'areaUnit', 'state', 'district']) {
    if (!data[field]) ctx.addIssue({ code: 'custom', path: [field], message: 'Required without a selected land.' });
  }
});

const steps = ['Land', 'Soil & location', 'Water & climate', 'Budget', 'Preferences', 'Review'];

export function AiAnalyzerPage() {
  const [step, setStep] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const navigate = useNavigate();
  const landsQuery = useMyLands({ limit: 50 });
  const landAnalysis = useAnalyzeLand();
  const lands = useMemo(() => landsQuery.data?.lands ?? [], [landsQuery.data?.lands]);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      season: 'monsoon',
      waterAvailability: 'adequate',
      budget: 100000,
      farmingExperience: 'beginner',
      preferredFarmingType: 'organic',
      irrigationAvailable: true,
      roadAccess: true,
      ownerParticipation: false,
    },
  });
  const selectedLandId = form.watch('landId');
  const selectedLand = useMemo(() => lands.find((land) => land._id === selectedLandId), [lands, selectedLandId]);

  async function nextStep() {
    const stepFields = [
      ['landId'],
      selectedLandId ? [] : ['soilType', 'landArea', 'areaUnit', 'state', 'district'],
      ['season', 'waterAvailability'],
      ['budget', 'farmingExperience'],
      ['preferredFarmingType'],
      [],
    ][step];
    const ok = stepFields.length ? await form.trigger(stepFields) : true;
    if (ok) setStep((value) => Math.min(value + 1, steps.length - 1));
  }

  async function onSubmit(values) {
    setStageIndex(0);
    const interval = window.setInterval(() => setStageIndex((value) => Math.min(value + 1, analysisStages.length - 1)), 900);
    try {
      const result = await landAnalysis.mutateAsync({
        ...values,
        landId: values.landId || undefined,
        preferredCrops: splitValues(values.preferredCrops),
      });
      navigate(`/ai-results/${result.history._id}`);
    } finally {
      window.clearInterval(interval);
    }
  }

  return (
    <section className="page-shell space-y-6">
      <div className="relative overflow-hidden rounded-[36px] border border-emerald-100 bg-white p-7 shadow-xl shadow-emerald-900/5">
        <div className="absolute right-8 top-8 h-28 w-28 rounded-full bg-purple-200/40 blur-3xl" />
        <p className="text-sm font-semibold uppercase text-emerald-600">AI Land Analyzer</p>
        <h1 className="mt-2 max-w-3xl text-4xl font-semibold text-slate-950">Turn land conditions into crop and profit recommendations.</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">Select one of your Hopt It lands or enter land details manually. Recommendations are generated only by the backend AI provider.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit">
          <CardContent className="space-y-3 p-4">
            {steps.map((label, index) => (
              <button key={label} type="button" className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left text-sm ${index === step ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-slate-700'}`} onClick={() => setStep(index)}>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/30 font-semibold">{index + 1}</span>
                {label}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{steps[step]}</CardTitle></CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
              {step === 0 ? <LandStep lands={lands} selectedLand={selectedLand} form={form} /> : null}
              {step === 1 ? <SoilStep form={form} disabled={Boolean(selectedLandId)} /> : null}
              {step === 2 ? <WaterStep form={form} /> : null}
              {step === 3 ? <BudgetStep form={form} /> : null}
              {step === 4 ? <PreferenceStep form={form} /> : null}
              {step === 5 ? <ReviewStep values={form.getValues()} selectedLand={selectedLand} /> : null}
              {landAnalysis.error ? <p className="rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">{landAnalysis.error.response?.data?.message ?? landAnalysis.error.message}</p> : null}
              {landAnalysis.isPending ? <ScanningStage stage={analysisStages[stageIndex]} /> : null}
              <div className="flex flex-wrap justify-between gap-3">
                <Button type="button" variant="outline" disabled={step === 0 || landAnalysis.isPending} onClick={() => setStep((value) => value - 1)}><ArrowLeft className="h-4 w-4" /> Back</Button>
                {step < steps.length - 1 ? <Button type="button" onClick={nextStep}>Next <ArrowRight className="h-4 w-4" /></Button> : <Button type="submit" disabled={landAnalysis.isPending}><Sparkles className="h-4 w-4" /> Analyze land</Button>}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function LandStep({ lands, selectedLand, form }) {
  return (
    <div className="space-y-4">
      <label className="grid gap-2 text-sm font-medium">Select your land<select className="premium-select" {...form.register('landId')}><option value="">Manual entry</option>{lands.map((land) => <option key={land._id} value={land._id}>{land.title} · {land.location?.district}</option>)}</select></label>
      {selectedLand ? <div className="rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-900">{selectedLand.area?.value} {selectedLand.area?.unit} in {selectedLand.location?.district}, {selectedLand.location?.state}</div> : <p className="text-sm text-muted-foreground">No land selected. The next step will ask for soil, area, and location details.</p>}
      <Button asChild variant="outline"><Link to="/my-lands">Manage lands</Link></Button>
    </div>
  );
}

function SoilStep({ form, disabled }) {
  return <div className="grid gap-4 sm:grid-cols-2"><SelectField label="Soil type" name="soilType" options={soilTypes} form={form} disabled={disabled} /><Field label="Land area" name="landArea" type="number" form={form} disabled={disabled} /><SelectField label="Area unit" name="areaUnit" options={areaUnits} form={form} disabled={disabled} /><Field label="District" name="district" form={form} disabled={disabled} /><Field label="State" name="state" form={form} disabled={disabled} /></div>;
}

function WaterStep({ form }) {
  return <div className="grid gap-4 sm:grid-cols-2"><SelectField label="Season" name="season" options={seasons} form={form} /><Field label="Temperature" name="temperature" type="number" form={form} /><Field label="Rainfall mm" name="rainfall" type="number" form={form} /><SelectField label="Water availability" name="waterAvailability" options={waterAvailabilityOptions} form={form} /><Toggle label="Irrigation available" name="irrigationAvailable" form={form} /><Toggle label="Road access" name="roadAccess" form={form} /></div>;
}

function BudgetStep({ form }) {
  return <div className="grid gap-4 sm:grid-cols-2"><Field label="Budget" name="budget" type="number" form={form} /><SelectField label="Experience" name="farmingExperience" options={experienceLevels} form={form} /><Field label="Market distance km" name="marketDistanceKm" type="number" form={form} /><Toggle label="Owner participation" name="ownerParticipation" form={form} /></div>;
}

function PreferenceStep({ form }) {
  return <div className="grid gap-4"><SelectField label="Preferred farming type" name="preferredFarmingType" options={farmingTypes} form={form} /><Field label="Preferred crops comma separated" name="preferredCrops" form={form} /></div>;
}

function ReviewStep({ values, selectedLand }) {
  return <div className="grid gap-3 sm:grid-cols-2">{Object.entries({ Land: selectedLand?.title ?? 'Manual entry', District: selectedLand?.location?.district ?? values.district, Soil: selectedLand?.landDetails?.soilType ?? values.soilType, Season: values.season, Budget: `₹${Number(values.budget ?? 0).toLocaleString('en-IN')}`, Water: values.waterAvailability }).map(([label, value]) => <div key={label} className="rounded-2xl border border-emerald-100 p-4"><p className="text-xs font-semibold uppercase text-emerald-600">{label}</p><p className="mt-1 font-medium">{value}</p></div>)}</div>;
}

function ScanningStage({ stage }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 rounded-3xl border border-purple-100 bg-purple-50 p-4"><div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white"><div className="absolute inset-0 animate-ping rounded-full bg-emerald-300/50" /><Brain className="relative h-7 w-7 text-purple-600" /></div><div><p className="font-semibold text-slate-950">{stage}</p><p className="text-sm text-muted-foreground">The AI provider is working on structured recommendations.</p></div><Loader2 className="ml-auto h-5 w-5 animate-spin text-emerald-600" /></motion.div>;
}

function Field({ label, name, form, type = 'text', disabled = false }) {
  return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Input id={name} type={type} disabled={disabled} {...form.register(name)} />{form.formState.errors[name] ? <p className="text-sm text-destructive">{form.formState.errors[name].message}</p> : null}</div>;
}

function SelectField({ label, name, options, form, disabled = false }) {
  return <label className="grid gap-2 text-sm font-medium">{label}<select className="premium-select" disabled={disabled} {...form.register(name)}><option value="">Select</option>{options.map((option) => <option key={option} value={option}>{labelize(option)}</option>)}</select>{form.formState.errors[name] ? <span className="text-sm text-destructive">{form.formState.errors[name].message}</span> : null}</label>;
}

function Toggle({ label, name, form }) {
  return <label className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-100 p-4 text-sm font-medium">{label}<input type="checkbox" className="h-5 w-5 accent-emerald-600" {...form.register(name)} /></label>;
}

function splitValues(value = '') {
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
}
