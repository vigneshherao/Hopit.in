import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { useCreateWorkerProfile, useMyWorkerProfile, useUpdateWorkerProfile } from '@/hooks/useWorkers.js';

const schema = z.object({
  headline: z.string().min(4),
  bio: z.string().min(20),
  professionalRoles: z.string().min(1),
  skills: z.string().min(1),
  experienceYears: z.coerce.number().min(0),
  city: z.string().min(1),
  district: z.string().min(1),
  state: z.string().min(1),
  dailyWage: z.coerce.number().min(0),
  monthlySalary: z.coerce.number().min(0).optional(),
});

export function WorkerProfileEditPage() {
  const navigate = useNavigate();
  const profileQuery = useMyWorkerProfile();
  const createProfile = useCreateWorkerProfile();
  const updateProfile = useUpdateWorkerProfile();
  const profile = profileQuery.data?.profile;
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { experienceYears: 0, dailyWage: 0 } });

  useEffect(() => {
    if (!profile) return;
    form.reset({
      headline: profile.headline,
      bio: profile.bio,
      professionalRoles: profile.professionalRoles?.join(', '),
      skills: profile.skills?.join(', '),
      experienceYears: profile.experienceYears,
      city: profile.location?.city,
      district: profile.location?.district,
      state: profile.location?.state,
      dailyWage: profile.pricing?.dailyWage ?? 0,
      monthlySalary: profile.pricing?.monthlySalary ?? 0,
    });
  }, [form, profile]);

  async function onSubmit(values) {
    const payload = {
      headline: values.headline,
      bio: values.bio,
      professionalRoles: splitValues(values.professionalRoles),
      skills: splitValues(values.skills),
      experienceYears: values.experienceYears,
      languages: ['Tamil', 'Kannada', 'English'],
      location: { city: values.city, district: values.district, state: values.state, country: 'India' },
      availability: { status: 'available', preferredDurationTypes: ['daily', 'monthly'], willingToRelocate: false, willingToStayOnFarm: true },
      pricing: { dailyWage: values.dailyWage, monthlySalary: values.monthlySalary, negotiable: true },
      workPreferences: { preferredCrops: [], preferredWorkTypes: splitValues(values.skills), acceptsIndividualWork: true, acceptsTeamWork: true, acceptsFarmManagement: values.professionalRoles.includes('farm-manager'), acceptsNightStay: true },
      documents: profile?.documents ?? [],
      portfolio: profile?.portfolio ?? [],
    };
    if (profile) await updateProfile.mutateAsync(payload);
    else await createProfile.mutateAsync(payload);
    navigate('/worker/profile');
  }

  return (
    <section className="page-shell">
      <Card className="mx-auto max-w-3xl">
        <CardHeader><CardTitle>{profile ? 'Edit worker profile' : 'Create worker profile'}</CardTitle></CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <Field label="Headline" name="headline" form={form} />
            <label className="grid gap-2 text-sm font-medium">Bio<textarea className="min-h-28 rounded-2xl border border-emerald-100 p-3" {...form.register('bio')} /></label>
            <Field label="Professional roles comma separated" name="professionalRoles" form={form} />
            <Field label="Skills comma separated" name="skills" form={form} />
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Experience years" name="experienceYears" type="number" form={form} /><Field label="Daily wage" name="dailyWage" type="number" form={form} /></div>
            <div className="grid gap-4 sm:grid-cols-3"><Field label="City" name="city" form={form} /><Field label="District" name="district" form={form} /><Field label="State" name="state" form={form} /></div>
            <Button type="submit" disabled={createProfile.isPending || updateProfile.isPending}>Save profile</Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

function Field({ label, name, form, type = 'text' }) {
  return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Input id={name} type={type} {...form.register(name)} />{form.formState.errors[name] ? <p className="text-sm text-destructive">{form.formState.errors[name].message}</p> : null}</div>;
}

function splitValues(value) {
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
}
