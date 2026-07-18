import { Activity, AlertTriangle, CalendarDays, CheckCircle2, ClipboardList, Layers, MapPin, Satellite, Sprout } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import {
  useCreateFieldObservation,
  useCreateZoneTask,
  useGenerateMonitoringReport,
  useMonitoringDashboard,
  useMonitoringReports,
  useMonitoringZones,
  useRemoteMonitoringScenes,
  useRequestSatelliteScene,
} from '@/hooks/useRemoteMonitoring.js';
import { formatMonitoringDate, healthLabel, zoneTone } from '@/utils/remoteMonitoringData.js';

const coverageColors = ['#059669', '#84cc16', '#f59e0b', '#a16207', '#94a3b8'];

export function FarmMonitoringPage() {
  const { farmPlanId, sceneId } = useParams();
  const planId = farmPlanId;
  const dashboardQuery = useMonitoringDashboard(planId);
  const zonesQuery = useMonitoringZones(planId);
  const scenesQuery = useRemoteMonitoringScenes(planId);
  const reportsQuery = useMonitoringReports(planId);
  const requestSatellite = useRequestSatelliteScene();
  const createTask = useCreateZoneTask();
  const createObservation = useCreateFieldObservation();
  const generateReport = useGenerateMonitoringReport();
  const dashboard = dashboardQuery.data;
  const zones = zonesQuery.data?.zones ?? [];
  const scenes = scenesQuery.data?.scenes ?? dashboard?.recentScenes ?? [];
  const coverage = dashboard?.coverage ?? {};
  const coverageChart = [
    { name: 'Healthy', value: coverage.healthy ?? 0 },
    { name: 'Moderate', value: coverage.moderate ?? 0 },
    { name: 'Stressed', value: coverage.stressed ?? 0 },
    { name: 'Bare soil', value: coverage.bareSoil ?? 0 },
    { name: 'Unavailable', value: coverage.unavailable ?? 0 },
  ];

  function requestDemoScenes() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 45);
    requestSatellite.mutate({ farmPlanId: planId, payload: { dateRange: { startDate, endDate }, maximumCloudCoverage: 70, analysisTypes: ['ndvi', 'rgb-health'] } });
  }

  if (dashboardQuery.isLoading) return <section className="page-shell"><div className="h-96 animate-pulse rounded-[36px] bg-emerald-50" /></section>;

  return (
    <section className="page-shell space-y-6">
      <div className="rounded-[40px] border border-emerald-100 bg-white p-6 shadow-2xl shadow-emerald-900/5 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase text-emerald-700"><Satellite className="h-4 w-4" /> Remote Monitoring</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-950">Geospatial crop-health monitoring</h1>
            <p className="mt-3 max-w-2xl text-slate-600">View farm boundaries, simulated satellite scenes, drone survey metadata, vegetation-health zones, field observations and monitoring reports.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild variant="outline"><Link to={`/farm-planner/${planId}`}>Planner</Link></Button>
              <Button asChild variant="outline"><Link to={`/farm-planner/${planId}/monitoring/map`}>Map</Link></Button>
              <Button asChild variant="outline"><Link to={`/farm-planner/${planId}/monitoring/scenes`}>Scenes</Link></Button>
              <Button asChild variant="outline"><Link to={`/farm-planner/${planId}/monitoring/zones`}>Zones</Link></Button>
              <Button disabled={requestSatellite.isPending} onClick={requestDemoScenes}><Satellite className="h-4 w-4" /> Request demo imagery</Button>
            </div>
          </div>
          <div className="rounded-[32px] border border-emerald-100 bg-emerald-50 p-5">
            <p className="text-sm font-semibold text-emerald-700">Overall crop health</p>
            <div className="mt-3 flex items-end justify-between">
              <div><p className="text-6xl font-semibold text-slate-950">{dashboard?.overallHealth?.score ?? 0}</p><p className="text-sm font-semibold text-slate-600">{dashboard?.overallHealth?.label ?? healthLabel(0)} · {dashboard?.overallHealth?.confidenceScore ?? 0}% confidence</p></div>
              <Activity className="h-16 w-16 text-emerald-700" />
            </div>
            {dashboard?.dataQuality?.isSimulated ? <span className="mt-4 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Simulated data</span> : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={Sprout} label="Healthy coverage" value={`${Math.round(coverage.healthy ?? 0)}%`} />
        <Metric icon={AlertTriangle} label="Stressed coverage" value={`${Math.round(coverage.stressed ?? 0)}%`} />
        <Metric icon={MapPin} label="Critical zones" value={dashboard?.zones?.critical ?? 0} />
        <Metric icon={CalendarDays} label="Image age" value={`${dashboard?.dataQuality?.imageAgeDays ?? '-'} days`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5 text-emerald-700" /> Farm map and layers</CardTitle></CardHeader>
          <CardContent>
            <div className="relative min-h-[420px] overflow-hidden rounded-[32px] border border-emerald-100 bg-[linear-gradient(135deg,#ecfdf5,#f8fafc)]">
              <div className="absolute left-[16%] top-[16%] h-[62%] w-[68%] rounded-[32px] border-4 border-emerald-600/70 bg-emerald-300/20 shadow-inner" />
              {zones.slice(0, 5).map((zone, index) => (
                <div key={zone._id} className={`absolute rounded-full border-2 ${zone.severity === 'critical' ? 'border-red-600 bg-red-400/30' : zone.severity === 'high' ? 'border-orange-500 bg-orange-300/30' : 'border-amber-500 bg-amber-200/40'}`} style={{ left: `${26 + index * 11}%`, top: `${28 + (index % 3) * 16}%`, width: `${80 + index * 8}px`, height: `${56 + index * 6}px` }} title={zone.title} />
              ))}
              <div className="absolute bottom-4 left-4 rounded-2xl bg-white/90 p-3 text-xs shadow">
                <p className="font-semibold text-slate-900">Layer: crop-health zones</p>
                <p className="text-slate-500">RGB/NDVI layers are represented as preview overlays.</p>
              </div>
              <div className="absolute right-4 top-4 rounded-2xl bg-white/90 p-3 text-xs shadow">
                <p className="font-semibold text-slate-900">Opacity 72%</p>
                <p className="text-slate-500">Boundary and risk zones only for this farm.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Coverage</CardTitle></CardHeader>
          <CardContent className="h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={coverageChart} innerRadius={70} outerRadius={120} dataKey="value">
                  {coverageChart.map((item, index) => <Cell key={item.name} fill={coverageColors[index]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Health trend</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboard?.trends?.healthScore ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" hide />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Area dataKey="value" stroke="#059669" fill="#dcfce7" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Zone distribution</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ name: 'Total', value: dashboard?.zones?.total ?? 0 }, { name: 'High', value: dashboard?.zones?.high ?? 0 }, { name: 'Critical', value: dashboard?.zones?.critical ?? 0 }, { name: 'Resolved', value: dashboard?.zones?.resolved ?? 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#059669" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader><CardTitle>Scene timeline</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            {scenes.map((scene) => (
              <div key={scene._id} className="grid gap-3 rounded-3xl border border-slate-100 p-4 md:grid-cols-[96px_1fr_auto] md:items-center">
                <div className="grid h-24 w-24 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><Satellite className="h-8 w-8" /></div>
                <div>
                  <p className="font-semibold text-slate-950">{scene.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{formatMonitoringDate(scene.capturedAt)} · {scene.sourceType} · {scene.spatialResolutionMeters}m · {scene.cloudCoverage}% cloud</p>
                  {scene.isSimulated ? <span className="mt-2 inline-flex rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">Simulated data</span> : null}
                </div>
                <Button asChild variant="outline"><Link to={`/farm-planner/${planId}/monitoring/scenes/${scene._id}`}>Open</Link></Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recommended actions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(dashboard?.recommendedActions ?? []).map((action) => <div key={action} className="rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-900"><CheckCircle2 className="mb-1 h-4 w-4" /> {action}</div>)}
            <Button className="w-full" disabled={generateReport.isPending} onClick={() => generateReport.mutate({ farmPlanId: planId, payload: { reportType: 'weekly-monitoring' } })}><ClipboardList className="h-4 w-4" /> Generate report</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Monitoring zones</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {zones.map((zone) => (
            <div key={zone._id} className="rounded-3xl border border-slate-100 p-4">
              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${zoneTone[zone.severity]}`}>{zone.severity}</span>
              <h3 className="mt-3 font-semibold text-slate-950">{zone.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{zone.description}</p>
              <p className="mt-2 text-xs font-semibold uppercase text-slate-400">{zone.zoneType} · {zone.confidenceScore}% confidence</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => createTask.mutate({ zoneId: zone._id, payload: {} })}>Create task</Button>
                <Button size="sm" variant="outline" onClick={() => createObservation.mutate({ farmPlanId: planId, payload: { monitoringZoneId: zone._id, title: `Observation for ${zone.title}`, observedCondition: zone.zoneType === 'possible-disease' ? 'possible-disease' : 'unknown', severity: zone.severity, imageUrls: [] } })}>Add observation</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Monitoring reports</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          {(reportsQuery.data?.reports ?? []).map((report) => <div key={report._id} className="rounded-2xl border border-slate-100 p-4"><strong>{report.title}</strong><p className="text-sm text-slate-500">{report.summary}</p></div>)}
          {sceneId ? <p className="text-sm text-slate-500">Scene detail route loaded for scene: {sceneId}</p> : null}
        </CardContent>
      </Card>
    </section>
  );
}

function Metric({ icon: Icon, label, value }) {
  return <Card><CardContent className="p-5"><Icon className="h-5 w-5 text-emerald-700" /><p className="mt-3 text-xs font-semibold uppercase text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p></CardContent></Card>;
}
