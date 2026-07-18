import { Link, useSearchParams } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { useAIHistory, useDeleteAIHistory } from '@/hooks/useAI.js';
import { labelize } from '@/utils/aiData.js';

export function AiHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = Object.fromEntries(searchParams.entries());
  const historyQuery = useAIHistory(filters);
  const deleteHistory = useDeleteAIHistory();
  const items = historyQuery.data?.items ?? [];

  function setFeature(feature) {
    const next = new URLSearchParams(searchParams);
    if (feature) next.set('feature', feature);
    else next.delete('feature');
    setSearchParams(next);
  }

  return (
    <section className="page-shell space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-[36px] border border-emerald-100 bg-white p-7 shadow-xl shadow-emerald-900/5 md:flex-row md:items-end">
        <div><p className="text-sm font-semibold uppercase text-emerald-600">AI History</p><h1 className="mt-2 text-4xl font-semibold text-slate-950">Saved land intelligence</h1></div>
        <Button asChild><Link to="/ai-analyzer">New analysis</Link></Button>
      </div>
      <Card><CardContent className="flex flex-wrap gap-2 p-4">{['', 'land-analysis', 'crop-recommendation', 'business-recommendation', 'chat'].map((feature) => <Button key={feature || 'all'} variant={filters.feature === feature || (!feature && !filters.feature) ? 'default' : 'outline'} onClick={() => setFeature(feature)}>{feature ? labelize(feature) : 'All'}</Button>)}</CardContent></Card>
      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item._id}>
            <CardContent className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-950">{item.response?.topRecommendedCrop ?? item.response?.landHealthScore ?? labelize(item.feature)}</h3><Badge>{labelize(item.feature)}</Badge>{item.metadata?.seededDemo ? <Badge variant="secondary">Demo data</Badge> : null}</div>
                <p className="mt-1 text-sm text-muted-foreground">{item.landId?.title ?? 'Manual analysis'} · {new Date(item.createdAt).toLocaleString('en-IN')}</p>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline"><Link to={`/ai-results/${item._id}`}>Open</Link></Button>
                <Button variant="destructive" size="icon" onClick={() => deleteHistory.mutate(item._id)} aria-label="Delete AI history"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {!historyQuery.isLoading && !items.length ? <Card><CardContent className="p-8 text-center text-muted-foreground">No AI history yet.</CardContent></Card> : null}
    </section>
  );
}
