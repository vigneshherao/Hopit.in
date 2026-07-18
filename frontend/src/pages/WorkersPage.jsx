import { Filter, Grid2X2, List, MapPin, Search, ShieldCheck, Star, UserRoundCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { useWorkers } from '@/hooks/useWorkers.js';
import { availabilityLabels, displayWorkerPrice, professionalRoles, workerRoleLabels, workerSkillLabels, workerSkills } from '@/utils/workerData.js';

export function WorkersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState('grid');
  const filters = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);
  const workersQuery = useWorkers(filters);
  const workers = workersQuery.data?.workers ?? [];
  const pagination = workersQuery.data?.pagination;

  function setFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  }

  return (
    <section className="page-shell space-y-7">
      <div className="flex flex-col justify-between gap-4 rounded-[32px] border border-emerald-100 bg-white/86 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-emerald-600">Hiring marketplace</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">Hire farm talent</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Find farm managers, supervisors, skilled specialists, service teams, and trusted workers.</p>
        </div>
        <div className="flex gap-2">
          <Button variant={view === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setView('grid')}><Grid2X2 className="h-4 w-4" /></Button>
          <Button variant={view === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setView('list')}><List className="h-4 w-4" /></Button>
          <Button asChild><Link to="/farm-jobs/new">Post Farm Job</Link></Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="h-fit rounded-3xl border border-emerald-100 bg-white/90 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] lg:sticky lg:top-24">
          <div className="mb-4 flex items-center gap-2 font-semibold"><Filter className="h-4 w-4" />Filters</div>
          <div className="grid gap-4">
            <FilterInput label="State" value={filters.state ?? ''} onChange={(value) => setFilter('state', value)} />
            <FilterInput label="District" value={filters.district ?? ''} onChange={(value) => setFilter('district', value)} />
            <FilterSelect label="Role" value={filters.professionalRole ?? ''} options={professionalRoles} labels={workerRoleLabels} onChange={(value) => setFilter('professionalRole', value)} />
            <FilterSelect label="Skill" value={filters.skill ?? ''} options={workerSkills} labels={workerSkillLabels} onChange={(value) => setFilter('skill', value)} />
            <FilterSelect label="Availability" value={filters.availabilityStatus ?? ''} options={Object.keys(availabilityLabels)} labels={availabilityLabels} onChange={(value) => setFilter('availabilityStatus', value)} />
          </div>
        </aside>

        <div className="space-y-5">
          <Card>
            <CardContent className="flex flex-col gap-3 p-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search worker, skill, role, city..." defaultValue={filters.search ?? ''} onKeyDown={(event) => event.key === 'Enter' && setFilter('search', event.currentTarget.value)} />
              </div>
              <select className="premium-select md:w-52" value={filters.sort ?? 'recommended'} onChange={(event) => setFilter('sort', event.target.value)}>
                <option value="recommended">Recommended</option>
                <option value="highest-rated">Highest rated</option>
                <option value="most-experienced">Most experienced</option>
                <option value="price-low-high">Price low to high</option>
                <option value="price-high-low">Price high to low</option>
                <option value="newest">Newest</option>
              </select>
            </CardContent>
          </Card>

          {workersQuery.isLoading ? <SkeletonGrid /> : null}
          {workersQuery.isError ? <StateMessage message="Unable to load workers." tone="error" /> : null}
          {!workersQuery.isLoading && workers.length === 0 ? <StateMessage message="No workers matched these filters." /> : null}

          <div className={view === 'grid' ? 'grid gap-5 md:grid-cols-2 xl:grid-cols-3' : 'grid gap-5'}>
            {workers.map((worker) => <WorkerCard key={worker._id} worker={worker} view={view} />)}
          </div>

          {pagination ? (
            <div className="flex flex-col gap-3 rounded-3xl border border-emerald-100 bg-white/90 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" disabled={pagination.page <= 1} onClick={() => setFilter('page', String(pagination.page - 1))}>Previous</Button>
                <Button variant="outline" disabled={pagination.page >= pagination.totalPages} onClick={() => setFilter('page', String(pagination.page + 1))}>Next</Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function WorkerCard({ worker, view }) {
  const user = worker.userId ?? {};
  return (
    <Card className={view === 'list' ? 'overflow-hidden md:grid md:grid-cols-[240px_1fr]' : 'overflow-hidden'}>
      <div className="aspect-[4/3] bg-emerald-50">
        {worker.profileImage ? <img src={worker.profileImage} alt={user.name ?? worker.headline} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center text-emerald-500"><UserRoundCheck className="h-16 w-16" /></div>}
      </div>
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">{user.name ?? worker.headline}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{worker.headline}</p>
          </div>
          {worker.identityVerification?.status === 'verified' ? <Badge><ShieldCheck className="mr-1 h-3 w-3" />Verified</Badge> : null}
        </div>
        <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{worker.location?.district}, {worker.location?.state}</p>
        <div className="flex flex-wrap gap-2">
          {worker.professionalRoles?.slice(0, 2).map((role) => <Badge key={role} variant="secondary">{workerRoleLabels[role] ?? role}</Badge>)}
          {worker.skills?.slice(0, 2).map((skill) => <Badge key={skill} variant="outline">{workerSkillLabels[skill] ?? skill}</Badge>)}
        </div>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <span>{worker.experienceYears} years experience</span>
          <span className="flex items-center gap-1"><Star className="h-4 w-4 text-emerald-500" />{worker.rating?.average ?? 0} ({worker.rating?.count ?? 0})</span>
          <span>{displayWorkerPrice(worker)}</span>
          <span>{availabilityLabels[worker.availability?.status] ?? worker.availability?.status}</span>
        </div>
        <div className="flex gap-2">
          <Button asChild className="flex-1"><Link to={`/workers/${worker._id}`}>View profile</Link></Button>
          <Button asChild variant="outline"><Link to="/farm-jobs/new">Hire</Link></Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterInput({ label, value, onChange }) {
  return <label className="grid gap-2 text-sm">{label}<Input defaultValue={value} onBlur={(event) => onChange(event.target.value)} /></label>;
}

function FilterSelect({ label, value, options, labels, onChange }) {
  return (
    <label className="grid gap-2 text-sm">{label}
      <select className="premium-select" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Any</option>
        {options.map((option) => <option key={option} value={option}>{labels[option] ?? option}</option>)}
      </select>
    </label>
  );
}

function SkeletonGrid() {
  return <div className="grid gap-4 md:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-80 animate-pulse rounded-3xl bg-emerald-50" />)}</div>;
}

function StateMessage({ message, tone }) {
  return <div className={`rounded-3xl border bg-white/90 p-8 text-center shadow-sm ${tone === 'error' ? 'border-destructive/30 text-destructive' : 'border-emerald-100 text-muted-foreground'}`}>{message}</div>;
}
