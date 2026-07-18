import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Search, Users } from 'lucide-react';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { useFarmJobs } from '@/hooks/useWorkers.js';
import { displayJobPay, hiringTypeLabels, jobWorkTypeLabels, professionalRoles, workerRoleLabels } from '@/utils/workerData.js';

export function FarmJobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);
  const jobsQuery = useFarmJobs(filters);
  const jobs = jobsQuery.data?.jobs ?? [];

  function setFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  return (
    <section className="page-shell space-y-7">
      <div className="flex flex-col justify-between gap-4 rounded-[32px] border border-emerald-100 bg-white/90 p-6 shadow-sm lg:flex-row lg:items-end">
        <div><p className="text-sm font-semibold uppercase text-emerald-600">Farm jobs</p><h1 className="mt-2 text-3xl font-semibold">Find agriculture work</h1><p className="mt-2 text-muted-foreground">Apply to one-day, seasonal, long-term, and farm-management opportunities.</p></div>
        <Button asChild><Link to="/farm-jobs/new">Post Farm Job</Link></Button>
      </div>
      <Card><CardContent className="flex flex-col gap-3 p-4 md:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search jobs..." defaultValue={filters.search ?? ''} onKeyDown={(event) => event.key === 'Enter' && setFilter('search', event.currentTarget.value)} /></div><select className="premium-select md:w-56" value={filters.professionalRole ?? ''} onChange={(event) => setFilter('professionalRole', event.target.value)}><option value="">Any role</option>{professionalRoles.map((role) => <option key={role} value={role}>{workerRoleLabels[role]}</option>)}</select></CardContent></Card>
      {jobsQuery.isLoading ? <div className="h-80 animate-pulse rounded-3xl bg-emerald-50" /> : null}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{jobs.map((job) => <FarmJobCard key={job._id} job={job} />)}</div>
      {!jobsQuery.isLoading && !jobs.length ? <Card><CardContent className="p-8 text-center text-muted-foreground">No open jobs matched your filters.</CardContent></Card> : null}
    </section>
  );
}

export function FarmJobCard({ job }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-semibold text-slate-950">{job.title}</h3><p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{job.location?.district}, {job.location?.state}</p></div><Badge>{job.status}</Badge></div>
        <p className="line-clamp-3 text-sm leading-6 text-slate-600">{job.description}</p>
        <div className="flex flex-wrap gap-2">{job.professionalRolesRequired?.slice(0, 2).map((role) => <Badge key={role} variant="secondary">{workerRoleLabels[role] ?? role}</Badge>)}<Badge variant="outline">{jobWorkTypeLabels[job.workType] ?? job.workType}</Badge></div>
        <div className="grid gap-2 text-sm sm:grid-cols-2"><span className="flex items-center gap-1"><Users className="h-4 w-4 text-emerald-500" />{job.numberOfWorkersRequired} needed</span><span>{hiringTypeLabels[job.hiringType]}</span><span>{displayJobPay(job)}</span><span>{job.schedule?.accommodationProvided ? 'Stay provided' : 'No stay'}</span></div>
        <Button asChild className="w-full"><Link to={`/farm-jobs/${job.slug ?? job._id}`}>View and apply</Link></Button>
      </CardContent>
    </Card>
  );
}
