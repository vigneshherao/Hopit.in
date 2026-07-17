import { Link, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { getDisplayPrice } from '@/components/lands/LandCard.jsx';
import { statusLabels } from '@/utils/landData.js';
import { useDeleteLand, useLandStatistics, useMyLands, useSubmitLandVerification, useUpdateLandStatus } from '@/hooks/useLands.js';

export function MyLandsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = Object.fromEntries(searchParams.entries());
  const landsQuery = useMyLands(filters);
  const statsQuery = useLandStatistics();
  const submitVerification = useSubmitLandVerification();
  const updateStatus = useUpdateLandStatus();
  const deleteLand = useDeleteLand();
  const stats = statsQuery.data?.statistics;

  function setStatus(status) {
    const next = new URLSearchParams(searchParams);
    if (status) next.set('status', status);
    else next.delete('status');
    setSearchParams(next);
  }

  async function confirmAction(message, action) {
    if (window.confirm(message)) await action();
  }

  return (
    <section className="page-shell space-y-7">
      <div className="flex flex-col justify-between gap-4 rounded-[32px] border border-emerald-100 bg-white/86 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-emerald-600">Owner workspace</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">My land listings</h1>
          <p className="mt-2 text-muted-foreground">Manage drafts, verification, availability, and listing status.</p>
        </div>
        <Button asChild><Link to="/lands/new"><Plus className="h-4 w-4" />Create listing</Link></Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Total', stats?.totalListings],
          ['Available', stats?.availableListings],
          ['Pending', stats?.pendingListings],
          ['Views', stats?.totalViews],
        ].map(([label, value]) => (
          <Card key={label}><CardHeader><CardTitle>{value ?? 0}</CardTitle><p className="text-sm text-muted-foreground">{label}</p></CardHeader></Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {['', 'draft', 'pending-verification', 'available', 'reserved', 'occupied', 'inactive'].map((status) => (
          <Button key={status || 'all'} variant={(filters.status ?? '') === status ? 'default' : 'outline'} onClick={() => setStatus(status)}>
            {status ? statusLabels[status] : 'All'}
          </Button>
        ))}
      </div>

      <div className="grid gap-4">
        {landsQuery.data?.lands?.map((land) => (
          <Card key={land._id}>
            <CardContent className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{land.title}</h3>
                  <Badge variant="secondary">{statusLabels[land.status]}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{land.location.district}, {land.location.state} · {getDisplayPrice(land)} · {land.viewCount} views · {land.applicationCount ?? 0} applications</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm"><Link to={`/my-lands/${land._id}`}>Manage</Link></Button>
                <Button asChild variant="outline" size="sm"><Link to={`/lands/${land._id}/edit`}>Edit</Link></Button>
                {land.status === 'draft' || land.status === 'rejected' ? <Button size="sm" onClick={() => submitVerification.mutate(land._id)}>Submit</Button> : null}
                {land.status === 'available' ? <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: land._id, action: 'pause' })}>Pause</Button> : null}
                {land.status === 'inactive' ? <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: land._id, action: 'resume' })}>Resume</Button> : null}
                <Button size="sm" variant="destructive" onClick={() => confirmAction('Deactivate this listing?', () => deleteLand.mutateAsync(land._id))}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
