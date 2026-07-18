import { Calendar, Droplets, RefreshCcw, Tractor, Users } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { useFarmDashboard, useRecalculatePlan, useUpdatePlan } from '@/hooks/useFarmPlanner.js';
import { formatCurrency, labelize, riskTone } from '@/utils/farmPlannerData.js';

const chartColors = ['#059669', '#7c3aed', '#f59e0b', '#0ea5e9'];

export function FarmPlannerDetailPage() {
  const { id } = useParams();
  const dashboardQuery = useFarmDashboard(id);
  const recalculate = useRecalculatePlan();
  const updatePlan = useUpdatePlan();
  const data = dashboardQuery.data;
  const plan = data?.plan;
  const dashboard = data?.dashboard;
  const recommendation = plan?.AIRecommendation ?? {};

  if (dashboardQuery.isLoading) return <section className="page-shell"><div className="h-96 animate-pulse rounded-3xl bg-emerald-50" /></section>;
  if (!plan) return <section className="page-shell"><Card><CardContent className="p-8 text-center text-muted-foreground">Farm plan not found.</CardContent></Card></section>;

  return (
    <section className="page-shell space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-[36px] border border-emerald-100 bg-white p-7 shadow-xl shadow-emerald-900/5 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-emerald-600">Planner Dashboard</p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-950">{plan.planTitle}</h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">{plan.description}</p>
          <div className="mt-4 flex flex-wrap gap-2"><Badge>{labelize(plan.status)}</Badge><Badge variant="secondary">{labelize(plan.currentStage)}</Badge><span className={`rounded-full px-3 py-1 text-xs font-semibold ${riskTone(plan.riskLevel)}`}>{labelize(plan.riskLevel)} risk</span></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={recalculate.isPending} onClick={() => recalculate.mutate({ id: plan._id, payload: { reason: 'Dashboard recalculation' } })}><RefreshCcw className="h-4 w-4" /> Recalculate</Button>
          <Button onClick={() => updatePlan.mutate({ id: plan._id, payload: { status: plan.status === 'active' ? 'paused' : 'active' } })}>{plan.status === 'active' ? 'Pause' : 'Activate'}</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Investment" value={formatCurrency(plan.estimatedInvestment)} />
        <Metric label="Revenue" value={formatCurrency(plan.estimatedRevenue)} />
        <Metric label="Profit" value={formatCurrency(plan.estimatedProfit)} />
        <Metric label="ROI" value={`${plan.expectedROI}%`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader><CardTitle>Investment, revenue and profit</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard.charts.investmentRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="value" radius={[12, 12, 0, 0]}>{dashboard.charts.investmentRevenue.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Progress</CardTitle></CardHeader>
          <CardContent className="grid place-items-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[{ name: 'Done', value: plan.progress.percentage }, { name: 'Remaining', value: 100 - plan.progress.percentage }]} innerRadius={65} outerRadius={95} dataKey="value">
                    <Cell fill="#059669" /><Cell fill="#ecfdf5" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-3xl font-semibold text-slate-950">{plan.progress.percentage}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboard.charts.timeline}>
                <defs><linearGradient id="timelineGreen" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="#059669" stopOpacity={0.45} /><stop offset="95%" stopColor="#059669" stopOpacity={0.03} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="cost" stroke="#059669" fill="url(#timelineGreen)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Execution resources</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Resource icon={Users} label="Labour" value={`${plan.labourRequirement?.totalWorkers ?? 0} workers`} />
            <Resource icon={Tractor} label="Equipment" value={`${plan.equipmentRequirement?.items?.length ?? 0} items`} />
            <Resource icon={Droplets} label="Water" value={labelize(plan.waterRequirement?.level)} />
            <Resource icon={Calendar} label="Harvest" value={new Date(plan.expectedHarvestDate).toLocaleDateString('en-IN')} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <PlanSection title="Land preparation" items={recommendation.landPreparation} />
        <PlanSection title="Fertilizer schedule" items={recommendation.fertilizerSchedule?.map((item) => `Day ${item.day}: ${item.item} - ${item.quantity}`)} />
        <PlanSection title="Pesticide schedule" items={recommendation.pesticideSchedule?.map((item) => `${item.stage}: ${item.treatment}`)} />
        <PlanSection title="Water schedule" items={recommendation.waterSchedule?.map((item) => `${item.stage}: ${item.frequency}`)} />
        <PlanSection title="Harvest schedule" items={recommendation.harvestSchedule?.steps} />
        <PlanSection title="Risk mitigation" items={recommendation.riskAnalysis?.mitigation} />
      </div>

      {plan.versions?.length ? (
        <Card>
          <CardHeader><CardTitle>Plan versions</CardTitle></CardHeader>
          <CardContent className="grid gap-3">{plan.versions.map((version) => <div key={version.version} className="rounded-2xl border border-emerald-100 p-4 text-sm"><strong>Version {version.version}</strong> · {formatCurrency(version.estimatedInvestment)} investment · {version.expectedROI}% ROI</div>)}</CardContent>
        </Card>
      ) : null}
    </section>
  );
}

function Metric({ label, value }) {
  return <Card><CardContent className="p-5"><p className="text-xs font-semibold uppercase text-emerald-600">{label}</p><p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p></CardContent></Card>;
}

function Resource({ icon: Icon, label, value }) {
  return <div className="rounded-3xl bg-emerald-50 p-4"><Icon className="h-5 w-5 text-emerald-600" /><p className="mt-3 text-xs font-semibold uppercase text-emerald-600">{label}</p><p className="mt-1 font-semibold text-slate-950">{value}</p></div>;
}

function PlanSection({ title, items = [] }) {
  return <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent className="space-y-2">{items.map((item) => <div key={item} className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">{item}</div>)}</CardContent></Card>;
}
