import { CloudRain, Droplets, RefreshCcw, ShieldAlert, Sprout, Sun, Thermometer, Waves, Wind } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import {
  useCurrentWeather,
  useDiseasePrediction,
  useFarmHealthForecast,
  usePestPrediction,
  useRefreshWeather,
  useStressPrediction,
  useWaterPrediction,
  useWeatherAlerts,
  useWeatherForecast,
  useWeatherInsights,
} from '@/hooks/useWeather.js';
import { formatWeatherDate, weatherPriorityTone } from '@/utils/weatherData.js';

export function FarmWeatherPage() {
  const { id } = useParams();
  const currentQuery = useCurrentWeather(id);
  const forecastQuery = useWeatherForecast(id);
  const insightsQuery = useWeatherInsights(id);
  const alertsQuery = useWeatherAlerts(id);
  const pestQuery = usePestPrediction(id);
  const diseaseQuery = useDiseasePrediction(id);
  const stressQuery = useStressPrediction(id);
  const waterQuery = useWaterPrediction(id);
  const healthQuery = useFarmHealthForecast(id);
  const refresh = useRefreshWeather();
  const current = currentQuery.data?.current;
  const summary = forecastQuery.data?.summary ?? currentQuery.data?.summary;
  const charts = forecastQuery.data?.charts ?? [];

  if (currentQuery.isLoading) return <section className="page-shell"><div className="h-96 animate-pulse rounded-[36px] bg-sky-50" /></section>;

  return (
    <section className="page-shell space-y-6">
      <div className="overflow-hidden rounded-[40px] border border-emerald-100 bg-white shadow-2xl shadow-emerald-900/5">
        <div className="grid gap-6 bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_35%),radial-gradient(circle_at_top_right,#dcfce7,transparent_32%)] p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase text-emerald-700"><CloudRain className="h-4 w-4" /> Weather Intelligence</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-950">Prevent pest, disease and crop stress before it starts</h1>
            <p className="mt-3 max-w-2xl text-slate-600">Forecasts combine with farm plan context to predict disease pressure, pest risk, water needs, crop stress and preventive actions.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild variant="outline"><Link to={`/farm-planner/${id}`}>Planner</Link></Button>
              <Button asChild variant="outline"><Link to={`/farm-planner/${id}/disease`}>Disease Check</Link></Button>
              <Button disabled={refresh.isPending} onClick={() => refresh.mutate({ farmPlanId: id, force: true })}><RefreshCcw className="h-4 w-4" /> Refresh weather</Button>
            </div>
          </div>
          <div className="rounded-[32px] border border-white/80 bg-white/80 p-5 shadow-xl backdrop-blur">
            <p className="text-sm font-semibold text-slate-500">Current weather</p>
            <div className="mt-4 flex items-end justify-between">
              <div><p className="text-6xl font-semibold text-slate-950">{Math.round(current?.temperature ?? 0)}°</p><p className="mt-2 text-slate-600">{current?.weatherCondition ?? 'Forecast unavailable'}</p></div>
              <Sun className="h-16 w-16 text-amber-500" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Mini icon={Droplets} label="Humidity" value={`${current?.humidity ?? 0}%`} />
              <Mini icon={Wind} label="Wind" value={`${Math.round(current?.windSpeed ?? 0)} km/h`} />
              <Mini icon={CloudRain} label="Rain" value={`${current?.rainProbability ?? 0}%`} />
              <Mini icon={ShieldAlert} label="Risk" value={summary?.riskLevel ?? 'Low'} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={Thermometer} label="Avg temperature" value={`${summary?.averageTemperature ?? 0}°C`} />
        <Metric icon={Droplets} label="Avg humidity" value={`${summary?.averageHumidity ?? 0}%`} />
        <Metric icon={CloudRain} label="Total rainfall" value={`${summary?.totalRainfall ?? 0} mm`} />
        <Metric icon={Wind} label="Max wind" value={`${summary?.maxWindSpeed ?? 0} km/h`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader><CardTitle>7-day forecast trend</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line dataKey="temperature" stroke="#ea580c" strokeWidth={3} />
                <Line dataKey="humidity" stroke="#0ea5e9" strokeWidth={3} />
                <Line dataKey="risk" stroke="#dc2626" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Water requirement</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-3xl bg-emerald-50 p-5">
              <Waves className="h-8 w-8 text-emerald-700" />
              <p className="mt-4 text-3xl font-semibold text-slate-950">{waterQuery.data?.water?.waterNeededLitresPerDay ?? 0} L/day</p>
              <p className="mt-2 text-sm text-slate-600">{waterQuery.data?.water?.nextIrrigation}</p>
              <p className="mt-3 text-sm font-semibold text-emerald-700">{waterQuery.data?.water?.action}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Rainfall analysis</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rainfall" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Farm health forecast</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={healthQuery.data?.forecast ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="days" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Area dataKey="expectedCropHealth" stroke="#059669" fill="#dcfce7" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <RiskSection title="Weather alerts" items={alertsQuery.data?.alerts ?? []} descriptionKey="message" />
        <RiskSection title="Preventive insights" items={insightsQuery.data?.insights ?? []} descriptionKey="recommendation" />
        <Card>
          <CardHeader><CardTitle>Stress meter</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(stressQuery.data?.stress ?? {}).map(([label, value]) => <ProgressRow key={label} label={label} value={value} />)}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <PredictionSection title="Pest risk prediction" icon={Sprout} items={pestQuery.data?.predictions ?? []} nameKey="pestName" />
        <PredictionSection title="Disease risk prediction" icon={ShieldAlert} items={diseaseQuery.data?.predictions ?? []} nameKey="diseaseName" />
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {(forecastQuery.data?.forecasts ?? []).slice(0, 7).map((forecast) => (
          <Card key={forecast._id ?? forecast.forecastDate}>
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-slate-500">{formatWeatherDate(forecast.forecastDate)}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">{Math.round(forecast.temperature)}°C</p>
              <p className="mt-1 text-sm text-slate-600">{forecast.weatherCondition}</p>
              <p className="mt-3 text-xs font-semibold text-sky-700">{forecast.rainProbability}% rain · {forecast.humidity}% humidity</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Mini({ icon: Icon, label, value }) {
  return <div className="rounded-2xl bg-white p-3"><Icon className="h-4 w-4 text-emerald-700" /><p className="mt-2 text-xs font-semibold uppercase text-slate-500">{label}</p><p className="font-semibold text-slate-950">{value}</p></div>;
}

function Metric({ icon: Icon, label, value }) {
  return <Card><CardContent className="p-5"><Icon className="h-5 w-5 text-emerald-700" /><p className="mt-3 text-xs font-semibold uppercase text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p></CardContent></Card>;
}

function RiskSection({ title, items, descriptionKey }) {
  return <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent className="space-y-3">{items.map((item) => <div key={item._id ?? item.title} className={`rounded-2xl border p-3 text-sm ${weatherPriorityTone[item.priority] ?? weatherPriorityTone.Low}`}><strong>{item.title}</strong><p className="mt-1">{item[descriptionKey]}</p></div>)}</CardContent></Card>;
}

function PredictionSection({ title, icon: Icon, items, nameKey }) {
  return <Card><CardHeader><CardTitle className="flex items-center gap-2"><Icon className="h-5 w-5 text-emerald-700" /> {title}</CardTitle></CardHeader><CardContent className="grid gap-3">{items.map((item) => <div key={item._id ?? item[nameKey]} className="rounded-3xl border border-slate-100 p-4"><div className="flex items-center justify-between gap-3"><strong>{item[nameKey]}</strong><span className={`rounded-full border px-3 py-1 text-xs font-semibold ${weatherPriorityTone[item.riskLevel]}`}>{item.riskLevel}</span></div><p className="mt-2 text-sm text-slate-600">{item.estimatedDamage ?? item.reasons?.[0]}</p><p className="mt-2 text-xs font-semibold text-slate-400">{item.confidence}% confidence</p></div>)}</CardContent></Card>;
}

function ProgressRow({ label, value }) {
  return <div><div className="mb-1 flex justify-between text-sm"><span className="capitalize text-slate-600">{label.replace(/([A-Z])/g, ' $1')}</span><strong>{value}%</strong></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-emerald-600" style={{ width: `${Math.min(100, value)}%` }} /></div></div>;
}

