import { ChevronDown, Grid2X2, List, MapPin, RotateCcw, Search, ShieldCheck, SlidersHorizontal, Star, UserRoundCheck } from 'lucide-react';
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

  function clearFilters() {
    setSearchParams(new URLSearchParams());
  }

  return (
    <section className="page-shell space-y-7">
      <div className="flex flex-col justify-between gap-5 rounded-[32px] border border-emerald-100 bg-white/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur lg:flex-row lg:items-end lg:p-7">
        <div>
          <p className="text-sm font-semibold uppercase text-emerald-600">Hiring marketplace</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">Hire farm talent</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Find farm managers, supervisors, skilled specialists, service teams, and trusted workers.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50/80 px-5 py-3">
            <p className="text-2xl font-semibold text-emerald-950">{pagination?.total ?? workers.length}</p>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">Profiles</p>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-slate-50 px-5 py-3">
            <p className="text-2xl font-semibold text-slate-950">{view === 'grid' ? 'Grid' : 'List'}</p>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">View mode</p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <WorkerFilterPanel filters={filters} setFilter={setFilter} clearFilters={clearFilters} view={view} setView={setView} />

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
    </section>
  );
}

function WorkerFilterPanel({ filters, setFilter, clearFilters, view, setView }) {
  const [isOpen, setIsOpen] = useState(false);
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => key !== 'page' && Boolean(value)).length;

  return (
    <Card className="sticky top-20 z-20 overflow-hidden border-emerald-100/80 bg-white/[0.96] shadow-[0_16px_50px_rgba(15,23,42,0.07)] backdrop-blur-xl">
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="h-12 rounded-2xl border-slate-200 bg-slate-50/80 pl-10 pr-4 font-medium shadow-inner focus-visible:bg-white"
              placeholder="Search worker, skill, role, city..."
              defaultValue={filters.search ?? ''}
              onKeyDown={(event) => {
                if (event.key === 'Enter') setFilter('search', event.currentTarget.value);
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <select
              className="premium-select h-12 rounded-2xl border-slate-200 sm:w-52"
              value={filters.sort ?? 'recommended'}
              onChange={(event) => setFilter('sort', event.target.value)}
              aria-label="Sort workers"
            >
              <option value="recommended">Recommended</option>
              <option value="highest-rated">Highest rated</option>
              <option value="most-experienced">Most experienced</option>
              <option value="price-low-high">Price low to high</option>
              <option value="price-high-low">Price high to low</option>
              <option value="newest">Newest</option>
            </select>
            <div className="flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
              <Button variant={view === 'grid' ? 'default' : 'ghost'} size="icon" className="h-10 rounded-xl" onClick={() => setView('grid')} aria-label="Grid view">
                <Grid2X2 className="h-4 w-4" />
              </Button>
              <Button variant={view === 'list' ? 'default' : 'ghost'} size="icon" className="h-10 rounded-xl" onClick={() => setView('list')} aria-label="List view">
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button asChild className="h-12 rounded-2xl">
              <Link to="/farm-jobs/new">Post Job</Link>
            </Button>
            <Button variant="outline" className="h-12 rounded-2xl" onClick={clearFilters}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button variant="outline" className="col-span-2 h-12 rounded-2xl sm:col-span-1" onClick={() => setIsOpen((value) => !value)} aria-expanded={isOpen}>
              Filters
              <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>

        <button
          type="button"
          className="flex w-full items-center gap-2 border-t border-slate-100 pt-4 text-left text-sm font-bold text-slate-950"
          onClick={() => setIsOpen((value) => !value)}
          aria-expanded={isOpen}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <SlidersHorizontal className="h-4 w-4" />
          </span>
          <div>
            <p>Smart filters</p>
            <p className="text-xs font-semibold normal-case tracking-normal text-slate-500">
              Refine talent by location, role, skill, and availability.
            </p>
          </div>
          <span className="ml-auto hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:inline-flex">
            {activeFilterCount} active
          </span>
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen ? (
          <div className="grid gap-3 rounded-[28px] border border-slate-100 bg-slate-50/70 p-3 md:grid-cols-2 lg:grid-cols-5">
            <FilterInput label="State" value={filters.state ?? ''} onChange={(value) => setFilter('state', value)} />
            <FilterInput label="District" value={filters.district ?? ''} onChange={(value) => setFilter('district', value)} />
            <FilterSelect label="Role" value={filters.professionalRole ?? ''} options={professionalRoles} labels={workerRoleLabels} onChange={(value) => setFilter('professionalRole', value)} />
            <FilterSelect label="Skill" value={filters.skill ?? ''} options={workerSkills} labels={workerSkillLabels} onChange={(value) => setFilter('skill', value)} />
            <FilterSelect label="Availability" value={filters.availabilityStatus ?? ''} options={Object.keys(availabilityLabels)} labels={availabilityLabels} onChange={(value) => setFilter('availabilityStatus', value)} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function WorkerCard({ worker, view }) {
  const user = worker.userId ?? {};
  const hireSearchParams = new URLSearchParams({
    workerId: worker?._id ?? '',
    workerName: user.name ?? worker?.headline ?? 'Selected worker',
    role: worker?.professionalRoles?.[0] ?? '',
    skills: worker?.skills?.slice(0, 4).join(',') ?? '',
    city: worker?.location?.city ?? '',
    district: worker?.location?.district ?? '',
    state: worker?.location?.state ?? '',
    amount: String(worker?.pricing?.dailyWage ?? worker?.pricing?.weeklyRate ?? worker?.pricing?.monthlySalary ?? ''),
  });
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
          <Button asChild variant="outline"><Link to={`/farm-jobs/new?${hireSearchParams.toString()}`}>Hire</Link></Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterInput({ label, value, onChange }) {
  return (
    <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
      {label}
      <Input className="h-11 rounded-2xl border-slate-200 bg-white text-sm font-medium normal-case tracking-normal text-slate-700" defaultValue={value} onBlur={(event) => onChange(event.target.value)} />
    </label>
  );
}

function FilterSelect({ label, value, options, labels, onChange }) {
  return (
    <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}
      <select className="premium-select h-11 rounded-2xl border-slate-200 text-sm font-medium normal-case tracking-normal text-slate-700" value={value} onChange={(event) => onChange(event.target.value)}>
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
