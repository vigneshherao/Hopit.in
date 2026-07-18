import { ChevronDown, Grid2X2, List, MapIcon, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
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
} from '@/utils/landData.js';
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

  function clearFilters() {
    setSearchParams(new URLSearchParams());
  }

  return (
    <section className="page-shell space-y-7">
      <div className="flex flex-col justify-between gap-5 rounded-[32px] border border-emerald-100 bg-white/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur lg:flex-row lg:items-end lg:p-7">
        <div>
          <p className="text-sm font-semibold uppercase text-emerald-600">Marketplace</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">Land marketplace</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Discover verified agricultural, commercial, solar, warehouse, and partnership-ready land.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50/80 px-5 py-3">
            <p className="text-2xl font-semibold text-emerald-950">{pagination?.total ?? lands.length}</p>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">Listings</p>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-slate-50 px-5 py-3">
            <p className="text-2xl font-semibold text-slate-950">{showMap ? 'Map' : view === 'grid' ? 'Grid' : 'List'}</p>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">View mode</p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <FilterPanel
          filters={filters}
          setFilter={setFilter}
          clearFilters={clearFilters}
          view={view}
          setView={setView}
          showMap={showMap}
          setShowMap={setShowMap}
        />

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
    </section>
  );
}

function FilterPanel({ filters, setFilter, clearFilters, view, setView, showMap, setShowMap }) {
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
              placeholder="Search land by title, city, district, soil..."
              defaultValue={filters.search ?? ''}
              onKeyDown={(event) => {
                if (event.key === 'Enter') setFilter('search', event.currentTarget.value);
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <select
              className="premium-select h-12 rounded-2xl border-slate-200 sm:w-52"
              value={filters.sort ?? 'newest'}
              onChange={(event) => setFilter('sort', event.target.value)}
              aria-label="Sort land listings"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price-low-high">Price low to high</option>
              <option value="price-high-low">Price high to low</option>
              <option value="area-low-high">Area low to high</option>
              <option value="area-high-low">Area high to low</option>
              <option value="most-viewed">Most viewed</option>
            </select>
            <div className="flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
              <Button
                variant={view === 'grid' ? 'default' : 'ghost'}
                size="icon"
                className="h-10 rounded-xl"
                onClick={() => setView('grid')}
                aria-label="Grid view"
              >
                <Grid2X2 className="h-4 w-4" />
              </Button>
              <Button
                variant={view === 'list' ? 'default' : 'ghost'}
                size="icon"
                className="h-10 rounded-xl"
                onClick={() => setView('list')}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant={showMap ? 'default' : 'outline'}
              className="h-12 rounded-2xl"
              onClick={() => setShowMap((value) => !value)}
            >
              <MapIcon className="h-4 w-4" />
              Map
            </Button>
            <Button variant="outline" className="h-12 rounded-2xl" onClick={clearFilters}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              variant="outline"
              className="col-span-2 h-12 rounded-2xl sm:col-span-1"
              onClick={() => setIsOpen((value) => !value)}
              aria-expanded={isOpen}
            >
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
              Refine land by location, soil, water, access, and transaction type.
            </p>
          </div>
          <span className="ml-auto hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:inline-flex">
            {activeFilterCount} active
          </span>
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen ? (
          <div className="grid gap-3 rounded-[28px] border border-slate-100 bg-slate-50/70 p-3 md:grid-cols-2 lg:grid-cols-4">
            <FilterInput label="State" value={filters.state ?? ''} onChange={(value) => setFilter('state', value)} />
            <FilterInput label="District" value={filters.district ?? ''} onChange={(value) => setFilter('district', value)} />
            <FilterSelect
              label="Purpose"
              value={filters.purpose ?? ''}
              options={landPurposes}
              labels={purposeLabels}
              onChange={(value) => setFilter('purpose', value)}
            />
            <FilterSelect
              label="Transaction"
              value={filters.transactionType ?? ''}
              options={transactionTypes}
              labels={transactionLabels}
              onChange={(value) => setFilter('transactionType', value)}
            />
            <FilterSelect label="Soil" value={filters.soilType ?? ''} options={soilTypes} onChange={(value) => setFilter('soilType', value)} />
            <FilterSelect
              label="Water"
              value={filters.waterAvailability ?? ''}
              options={waterAvailabilityOptions}
              onChange={(value) => setFilter('waterAvailability', value)}
            />
            <FilterSelect label="Road access" value={filters.roadAccess ?? ''} options={['true', 'false']} onChange={(value) => setFilter('roadAccess', value)} />
            <FilterSelect
              label="Electricity"
              value={filters.electricityAvailable ?? ''}
              options={['true', 'false']}
              onChange={(value) => setFilter('electricityAvailable', value)}
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function FilterInput({ label, value, onChange }) {
  return (
    <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
      {label}
      <Input
        className="h-11 rounded-2xl border-slate-200 bg-white text-sm font-medium normal-case tracking-normal text-slate-700"
        defaultValue={value}
        onBlur={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function FilterSelect({ label, value, options, labels = {}, onChange }) {
  return (
    <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
      {label}
      <select
        className="premium-select h-11 rounded-2xl border-slate-200 text-sm font-medium normal-case tracking-normal text-slate-700"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Any</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {labels[option] ?? option}
          </option>
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
