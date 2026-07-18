import { AlertTriangle, ArrowLeft, BarChart3, Brain, RefreshCcw } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { useAnalyzeFarm, useFarmInsights, useFarmRecommendations, useForecast } from '@/hooks/useAssistant.js';
import { healthTone, priorityTone } from '@/utils/assistantData.js';

const priorities = ['Critical', 'High', 'Medium', 'Low'];
const pieColors = ['#dc2626', '#ea580c', '#d97706', '#059669'];

export function FarmInsightsPage() {
  const { id } = useParams();
  const insightsQuery = useFarmInsights(id);
  const recommendationsQuery = useFarmRecommendations(id);
  const forecastQuery = useForecast(id);
  const analyzeMutation = useAnalyzeFarm();
  const grouped = insightsQuery.data?.grouped ?? {};
  const health = insightsQuery.data?.health;
  const chartData = priorities.map((priority) => ({ name: priority, value: grouped[priority]?.length ?? 0 }));

  return (
    <section className="page-shell space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-[36px] border border-emerald-100 bg-white p-6 shadow-xl shadow-emerald-900/5 lg:flex-row lg:items-end">
        <div>
          <Button asChild variant="ghost" className="mb-3 px-0"><Link to={`/farm-planner/${id}`}><ArrowLeft className="h-4 w-4" /> Planner</Link></Button>
          <p className="flex items-center gap-2 text-sm font-semibold uppercase text-emerald-700"><Brain className="h-4 w-4" /> Smart Insights</p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-950">Decision support for this farm</h1>
          <p className="mt-3 max-w-2xl text-slate-600">Insights combine the farm plan, tasks, calendar, harvest window, budget estimates and current risk profile.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline"><Link to={`/farm-planner/${id}/assistant`}>Open Assistant</Link></Button>
          <Button disabled={analyzeMutation.isPending} onClick={() => analyzeMutation.mutate({ farmPlanId: id, focus: 'weekly-advice' })}>
            <RefreshCcw className="h-4 w-4" /> AI analyze
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-slate-500">Farm health score</p>
            <p className="mt-3 text-5xl font-semibold text-slate-950">{health?.score ?? 0}</p>
            <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${healthTone[health?.label] ?? 'bg-slate-100 text-slate-700'}`}>{health?.label ?? 'Unknown'}</span>
          </CardContent>
        </Card>
        {priorities.map((priority) => (
          <Card key={priority}>
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-slate-500">{priority}</p>
              <p className="mt-3 text-4xl font-semibold text-slate-950">{grouped[priority]?.length ?? 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {priorities.map((priority) => (
            <section key={priority} className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-950">{priority}</h2>
              {(grouped[priority] ?? []).length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {grouped[priority].map((insight) => <InsightCard key={insight._id} insight={insight} />)}
                </div>
              ) : (
                <Card><CardContent className="p-5 text-sm text-slate-500">No {priority.toLowerCase()} insights right now.</CardContent></Card>
              )}
            </section>
          ))}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Priority mix</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} innerRadius={55} outerRadius={90} dataKey="value">
                    {chartData.map((entry, index) => <Cell key={entry.name} fill={pieColors[index]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Recommendations</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {(recommendationsQuery.data?.recommendations ?? []).slice(0, 8).map((item) => (
                <div key={`${item.title}-${item.action}`} className="rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-900">
                  <strong>{item.title}</strong>
                  <p className="mt-1">{item.action}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Forecast</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {(forecastQuery.data?.forecasts ?? []).slice(0, 5).map((forecast) => (
                <div key={forecast.forecastType} className="rounded-2xl border border-slate-100 p-3 text-sm">
                  <div className="flex items-center justify-between gap-3"><strong>{forecast.forecastType}</strong><span className="text-xs text-slate-500">{forecast.confidence}%</span></div>
                  <p className="mt-1 text-slate-600">{forecast.prediction}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function InsightCard({ insight }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${priorityTone[insight.priority]}`}>{insight.priority}</span>
            <h3 className="mt-3 text-lg font-semibold text-slate-950">{insight.title}</h3>
          </div>
          {insight.priority === 'Critical' ? <AlertTriangle className="h-5 w-5 text-red-600" /> : <BarChart3 className="h-5 w-5 text-emerald-600" />}
        </div>
        <p className="mt-3 text-sm text-slate-600">{insight.description}</p>
        <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">{insight.recommendation}</div>
        <p className="mt-3 text-xs font-semibold uppercase text-slate-400">{insight.category} · {insight.confidenceScore}% confidence</p>
      </CardContent>
    </Card>
  );
}

