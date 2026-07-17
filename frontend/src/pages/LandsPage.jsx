import { Filter, Grid2X2, List, MapIcon, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { LandCard } from '@/components/lands/LandCard.jsx';
import { LandMap } from '@/components/lands/LandMap.jsx';
import {
  landPurposes,
  purposeLabels,
  soilTypes,
  transactionLabels,
  transactionTypes,
  waterAvailabilityOptions,
} from '@/constants/land.js';
import { useLands } from '@/hooks/useLands.js';

export function LandsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState('grid');
  const [showMap, setShowMap] = useState(false);
  const filters = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);
  const landsQuery = useLands(filters);
  const lands = landsQuery.data?.lands ?? [];
  const pagination = landsQuery.data?.pagination;

  function setFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  }

  return (
    <section className="page-shell space-y-7">
      <div className="flex flex-col justify-between gap-4 rounded-[32px] border border-emerald-100 bg-white/86 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur lg:flex-row lg:items-end lg:p-7">
        <div>
          <p className="text-sm font-semibold uppercase text-emerald-600">Marketplace</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">Land marketplace</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Discover verified agricultural, commercial, solar, warehouse, and partnership-ready land.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant={view === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setView('grid')}>
            <Grid2X2 className="h-4 w-4" />
          </Button>
          <Button variant={view === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setView('list')}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant={showMap ? 'default' : 'outline'} onClick={() => setShowMap((value) => !value)}>
            <MapIcon className="h-4 w-4" />
            Map
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <FilterPanel filters={filters} setFilter={setFilter} />
        <div className="space-y-4">
          <Card>
            <CardContent className="flex flex-col gap-3 p-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search by title, city, district, soil..."
                  defaultValue={filters.search ?? ''}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') setFilter('search', event.currentTarget.value);
                  }}
                />
              </div>
              <select
                className="premium-select md:w-52"
                value={filters.sort ?? 'newest'}
                onChange={(event) => setFilter('sort', event.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price-low-high">Price low to high</option>
                <option value="price-high-low">Price high to low</option>
                <option value="area-low-high">Area low to high</option>
                <option value="area-high-low">Area high to low</option>
                <option value="most-viewed">Most viewed</option>
              </select>
            </CardContent>
          </Card>

          {showMap ? <LandMap lands={lands} height={420} /> : null}

          {landsQuery.isLoading ? <SkeletonGrid /> : null}
          {landsQuery.isError ? <ErrorState /> : null}
          {!landsQuery.isLoading && lands.length === 0 ? <EmptyState /> : null}

          <div className={view === 'grid' ? 'grid gap-5 md:grid-cols-2 xl:grid-cols-3' : 'grid gap-5'}>
            {lands.map((land) => (
              <LandCard key={land._id ?? land.slug} land={land} view={view} />
            ))}
          </div>

          {pagination ? (
            <div className="flex flex-col gap-3 rounded-3xl border border-emerald-100 bg-white/90 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={pagination.page <= 1}
                  onClick={() => setFilter('page', String(pagination.page - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setFilter('page', String(pagination.page + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function FilterPanel({ filters, setFilter }) {
  return (
    <aside className="h-fit rounded-3xl border border-emerald-100 bg-white/90 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur lg:sticky lg:top-24">
      <div className="mb-4 flex items-center gap-2 font-semibold text-slate-950">
        <Filter className="h-4 w-4" />
        Filters
      </div>
      <div className="grid gap-4">
        <FilterInput label="State" value={filters.state ?? ''} onChange={(value) => setFilter('state', value)} />
        <FilterInput label="District" value={filters.district ?? ''} onChange={(value) => setFilter('district', value)} />
        <FilterSelect label="Purpose" value={filters.purpose ?? ''} options={landPurposes} labels={purposeLabels} onChange={(value) => setFilter('purpose', value)} />
        <FilterSelect label="Transaction" value={filters.transactionType ?? ''} options={transactionTypes} labels={transactionLabels} onChange={(value) => setFilter('transactionType', value)} />
        <FilterSelect label="Soil" value={filters.soilType ?? ''} options={soilTypes} onChange={(value) => setFilter('soilType', value)} />
        <FilterSelect label="Water" value={filters.waterAvailability ?? ''} options={waterAvailabilityOptions} onChange={(value) => setFilter('waterAvailability', value)} />
        <FilterSelect label="Road access" value={filters.roadAccess ?? ''} options={['true', 'false']} onChange={(value) => setFilter('roadAccess', value)} />
        <FilterSelect label="Electricity" value={filters.electricityAvailable ?? ''} options={['true', 'false']} onChange={(value) => setFilter('electricityAvailable', value)} />
      </div>
    </aside>
  );
}

function FilterInput({ label, value, onChange }) {
  return (
    <label className="grid gap-2 text-sm">
      {label}
      <Input defaultValue={value} onBlur={(event) => onChange(event.target.value)} />
    </label>
  );
}

function FilterSelect({ label, value, options, labels = {}, onChange }) {
  return (
    <label className="grid gap-2 text-sm">
      {label}
      <select className="premium-select" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Any</option>
        {options.map((option) => (
          <option key={option} value={option}>{labels[option] ?? option}</option>
        ))}
      </select>
    </label>
  );
}

function SkeletonGrid() {
  return <div className="grid gap-4 md:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-80 animate-pulse rounded-3xl bg-emerald-50" />)}</div>;
}

function EmptyState() {
  return <div className="rounded-3xl border border-emerald-100 bg-white/90 p-8 text-center text-muted-foreground shadow-sm">No available land matched these filters.</div>;
}

function ErrorState() {
  return <div className="rounded-3xl border border-destructive/30 bg-white/90 p-8 text-center text-destructive shadow-sm">Unable to load land listings.</div>;
}
