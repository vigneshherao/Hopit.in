import { Link, useParams } from 'react-router-dom';
import { BriefcaseBusiness, Languages, MapPin, ShieldCheck, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { useWorker } from '@/hooks/useWorkers.js';
import { availabilityLabels, displayWorkerPrice, workerRoleLabels, workerSkillLabels } from '@/utils/workerData.js';

export function WorkerDetailPage() {
  const { id } = useParams();
  const workerQuery = useWorker(id);
  const worker = workerQuery.data?.worker;
  const reviews = workerQuery.data?.reviews ?? [];
  const user = worker?.userId ?? {};

  if (workerQuery.isLoading) return <section className="page-shell"><div className="h-96 animate-pulse rounded-3xl bg-emerald-50" /></section>;
  if (!worker) return <section className="page-shell"><Card><CardContent className="p-8 text-center">Worker profile not found.</CardContent></Card></section>;

  return (
    <section className="page-shell space-y-6">
      <Card className="overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-emerald-100 to-lime-50">
          {worker.coverImage ? <img src={worker.coverImage} alt="" className="h-full w-full object-cover" /> : null}
        </div>
        <CardContent className="-mt-12 grid gap-6 p-6 lg:grid-cols-[220px_1fr_auto]">
          <img src={worker.profileImage ?? user.avatar ?? 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=400&q=80'} alt={user.name ?? worker.headline} className="h-40 w-40 rounded-[32px] border-4 border-white object-cover shadow-xl" />
          <div className="pt-12 lg:pt-16">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-semibold text-slate-950">{user.name ?? worker.headline}</h1>
              {worker.identityVerification?.status === 'verified' ? <Badge><ShieldCheck className="mr-1 h-3 w-3" />Verified</Badge> : null}
            </div>
            <p className="mt-2 text-lg text-slate-700">{worker.headline}</p>
            <p className="mt-3 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{worker.location?.district}, {worker.location?.state}</p>
            <p className="mt-4 max-w-3xl leading-7 text-slate-600">{worker.bio}</p>
          </div>
          <div className="pt-0 lg:pt-16">
            <Button asChild><Link to="/farm-jobs/new">Hire worker</Link></Button>
            <Button asChild variant="outline" className="mt-2 w-full"><Link to="/farm-jobs">Invite to job</Link></Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-5">
          <InfoCard title="Roles and Skills">
            <div className="flex flex-wrap gap-2">{worker.professionalRoles?.map((role) => <Badge key={role}>{workerRoleLabels[role] ?? role}</Badge>)}</div>
            <div className="mt-3 flex flex-wrap gap-2">{worker.skills?.map((skill) => <Badge key={skill} variant="outline">{workerSkillLabels[skill] ?? skill}</Badge>)}</div>
          </InfoCard>
          <InfoCard title="Experience">
            <p className="flex items-center gap-2 text-slate-700"><BriefcaseBusiness className="h-4 w-4 text-emerald-500" />{worker.experienceYears} years</p>
            <p className="mt-3 leading-7 text-muted-foreground">{worker.experienceDescription ?? 'Experience details are not added yet.'}</p>
          </InfoCard>
          <InfoCard title="Portfolio">
            <div className="grid gap-3 sm:grid-cols-2">
              {(worker.portfolio ?? []).map((item) => <div key={item.title} className="rounded-2xl border border-emerald-100 p-4"><h3 className="font-semibold">{item.title}</h3><p className="mt-2 text-sm text-muted-foreground">{item.description}</p></div>)}
              {!worker.portfolio?.length ? <p className="text-muted-foreground">No portfolio items yet.</p> : null}
            </div>
          </InfoCard>
          <InfoCard title="Reviews">
            <div className="grid gap-3">{reviews.map((review) => <div key={review._id} className="rounded-2xl border border-emerald-100 p-4"><p className="font-semibold">{review.title}</p><p className="text-sm text-muted-foreground">{review.comment}</p></div>)}</div>
            {!reviews.length ? <p className="text-muted-foreground">No public reviews yet.</p> : null}
          </InfoCard>
        </div>
        <div className="grid gap-5">
          <InfoCard title="Availability">
            <p>{availabilityLabels[worker.availability?.status] ?? worker.availability?.status}</p>
            <p className="mt-2 text-sm text-muted-foreground">Relocate: {worker.availability?.willingToRelocate ? 'Yes' : 'No'} · Farm stay: {worker.availability?.willingToStayOnFarm ? 'Yes' : 'No'}</p>
          </InfoCard>
          <InfoCard title="Pricing">
            <p className="text-2xl font-semibold text-slate-950">{displayWorkerPrice(worker)}</p>
          </InfoCard>
          <InfoCard title="Trust">
            <p className="flex items-center gap-2"><Star className="h-4 w-4 text-emerald-500" />{worker.rating?.average ?? 0} rating · {worker.completedJobs ?? 0} completed jobs</p>
            <p className="mt-2 flex items-center gap-2"><Languages className="h-4 w-4 text-emerald-500" />{worker.languages?.join(', ') || 'Languages not added'}</p>
          </InfoCard>
        </div>
      </div>
    </section>
  );
}

function InfoCard({ title, children }) {
  return <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent>{children}</CardContent></Card>;
}
