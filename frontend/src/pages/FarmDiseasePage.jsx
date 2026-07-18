import { Activity, AlertTriangle, Camera, CheckCircle2, ImagePlus, Loader2, ShieldCheck, Trash2, UploadCloud } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { useAnalyzeDisease, useDiseaseHistory, useDiseaseStatistics, useFarmDiseaseHistory } from '@/hooks/useDisease.js';
import { useFarmDashboard } from '@/hooks/useFarmPlanner.js';
import { formatDiseaseDate, healthColor, healthLabel, severityTone, validateDiseaseFiles } from '@/utils/diseaseData.js';
import { formatCurrency } from '@/utils/farmPlannerData.js';

export function FarmDiseasePage() {
  const { id } = useParams();
  const dashboardQuery = useFarmDashboard(id);
  const statisticsQuery = useDiseaseStatistics();
  const historyQuery = useDiseaseHistory({ farmPlanId: id, limit: 10 });
  const farmHistoryQuery = useFarmDiseaseHistory(id);
  const analyzeMutation = useAnalyzeDisease();
  const plan = dashboardQuery.data?.plan;
  const [cropName, setCropName] = useState('');
  const [weatherSummary, setWeatherSummary] = useState('');
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const result = analyzeMutation.data;
  const analysis = result?.analysis;
  const previews = useMemo(() => images.map((file) => ({ file, url: URL.createObjectURL(file) })), [images]);
  const trendData = (farmHistoryQuery.data?.timeline ?? []).map((item) => ({ date: formatDiseaseDate(item.createdAt), health: item.healthScore }));
  const severityData = ['Healthy', 'Low', 'Medium', 'High', 'Critical'].map((severity) => ({
    severity,
    count: (historyQuery.data?.analyses ?? []).filter((item) => item.severity === severity).length,
  }));

  function addFiles(fileList) {
    const nextFiles = [...images, ...Array.from(fileList)].slice(0, 5);
    const validation = validateDiseaseFiles(nextFiles);
    setError(validation);
    if (!validation) setImages(nextFiles);
  }

  function submit(event) {
    event.preventDefault();
    const validation = validateDiseaseFiles(images);
    if (validation) {
      setError(validation);
      return;
    }
    if (!images.length) {
      setError('Upload at least one crop image.');
      return;
    }
    analyzeMutation.mutate({ farmPlanId: id, cropName: cropName || plan?.selectedCrop || 'Crop', farmerState: plan?.landId?.location?.state, weatherSummary, images });
  }

  return (
    <section className="page-shell space-y-6">
      <div className="rounded-[40px] border border-emerald-100 bg-white p-6 shadow-2xl shadow-emerald-900/5 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase text-emerald-700"><ShieldCheck className="h-4 w-4" /> AI Crop Disease Detection</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Upload crop images for a health report</h1>
            <p className="mt-3 max-w-2xl text-slate-600">Hopt It validates each image, checks for duplicates, sends safe image context to the AI provider, and stores a structured disease report.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Total analyses" value={statisticsQuery.data?.totalAnalyses ?? 0} />
            <Metric label="Average health" value={`${statisticsQuery.data?.averageHealthScore ?? 0}%`} />
            <Metric label="Healthy crops" value={statisticsQuery.data?.healthyCrops ?? 0} />
            <Metric label="Most common" value={statisticsQuery.data?.mostCommonDisease ?? '-'} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader><CardTitle>Upload and analyze</CardTitle></CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={submit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold text-slate-700">
                  Crop name
                  <Input value={cropName} onChange={(event) => setCropName(event.target.value)} placeholder={plan?.selectedCrop ?? 'Tomato'} />
                </label>
                <label className="space-y-2 text-sm font-semibold text-slate-700">
                  Weather notes
                  <Input value={weatherSummary} onChange={(event) => setWeatherSummary(event.target.value)} placeholder="Humid week, light rainfall..." />
                </label>
              </div>

              <ImageDropZone onFiles={addFiles} />
              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              {previews.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {previews.map((preview, index) => (
                    <div key={`${preview.file.name}-${index}`} className="group relative overflow-hidden rounded-3xl border border-emerald-100">
                      <img src={preview.url} alt={preview.file.name} className="aspect-square w-full object-cover" />
                      <button type="button" className="absolute right-2 top-2 rounded-full bg-white/90 p-2 text-red-600 shadow" onClick={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              <Button className="w-full" disabled={analyzeMutation.isPending}>
                {analyzeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
                {analyzeMutation.isPending ? 'Analyzing crop health...' : 'Analyze crop images'}
              </Button>
              {analyzeMutation.error ? <p className="text-sm text-red-600">{analyzeMutation.error.response?.data?.message ?? 'Disease analysis failed.'}</p> : null}
            </form>
          </CardContent>
        </Card>

        {analysis ? <DiseaseResult result={result} /> : <DiseaseEmptyState />}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Health score trend</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="health" stroke="#059669" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Severity frequency</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="severity" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                  {severityData.map((item) => <Cell key={item.severity} fill={healthColor(item.severity === 'Healthy' ? 90 : item.severity === 'Critical' ? 20 : 60)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Disease history</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          {(historyQuery.data?.analyses ?? []).map((item) => (
            <div key={item._id} className="grid gap-3 rounded-3xl border border-slate-100 p-4 sm:grid-cols-[96px_1fr_auto] sm:items-center">
              <img src={item.images?.[0]?.thumbnailUrl ?? item.images?.[0]?.imageUrl} alt={item.diseaseName} className="h-24 w-24 rounded-2xl object-cover" />
              <div>
                <p className="font-semibold text-slate-950">{item.diseaseName}</p>
                <p className="mt-1 text-sm text-slate-500">{formatDiseaseDate(item.createdAt)} · {item.cropName}</p>
              </div>
              <div className="text-right">
                <SeverityBadge severity={item.severity} />
                <p className="mt-2 text-sm font-semibold text-slate-700">{item.cropHealthScore}% health</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

function ImageDropZone({ onFiles }) {
  return (
    <label
      className="flex cursor-pointer flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-emerald-200 bg-emerald-50/60 p-8 text-center transition hover:bg-emerald-50"
      onDrop={(event) => {
        event.preventDefault();
        onFiles(event.dataTransfer.files);
      }}
      onDragOver={(event) => event.preventDefault()}
    >
      <UploadCloud className="h-10 w-10 text-emerald-600" />
      <span className="mt-3 font-semibold text-slate-950">Drop crop images or browse</span>
      <span className="mt-1 text-sm text-slate-500">JPEG, PNG or WEBP. Up to 5 images, 10 MB each.</span>
      <span className="mt-3 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700"><Camera className="h-4 w-4" /> Camera or gallery</span>
      <input type="file" accept="image/jpeg,image/png,image/webp" multiple capture="environment" className="sr-only" onChange={(event) => onFiles(event.target.files)} />
    </label>
  );
}

function DiseaseResult({ result }) {
  const analysis = result.analysis;
  const recommendations = result.recommendations ?? [];
  const images = result.images ?? [];
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-slate-50/70">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Crop health report</CardTitle>
          <SeverityBadge severity={analysis.severity} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
          <div className="grid gap-3">
            {images.slice(0, 2).map((image) => <img key={image._id} src={image.imageUrl} alt={analysis.diseaseName} className="aspect-square rounded-3xl object-cover" />)}
          </div>
          <div>
            <p className="text-sm font-semibold uppercase text-emerald-700">Possible disease</p>
            <h2 className="mt-1 text-3xl font-semibold text-slate-950">{analysis.diseaseName}</h2>
            <p className="mt-3 text-slate-600">{analysis.summary}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <HealthScoreCard score={analysis.cropHealthScore} />
              <Metric label="Confidence" value={`${analysis.confidenceScore}%`} />
              <Metric label="Recovery" value={`${analysis.estimatedRecoveryDays} days`} />
            </div>
          </div>
        </div>
        <TreatmentAccordion title="Symptoms" items={analysis.symptoms} />
        <TreatmentAccordion title="Likely causes" items={analysis.causes} />
        <TreatmentAccordion title="Organic treatment" items={analysis.organicTreatment} />
        <TreatmentAccordion title="Chemical treatment" items={analysis.chemicalTreatment} />
        <TreatmentAccordion title="Prevention" items={analysis.prevention} />
        <TreatmentAccordion title="Monitoring advice" items={analysis.monitoringAdvice} />
        <div className="rounded-3xl bg-amber-50 p-4 text-sm text-amber-800"><AlertTriangle className="mb-2 h-5 w-5" /> {analysis.weatherRisk}</div>
        <div className="grid gap-3 md:grid-cols-2">
          {recommendations.map((recommendation) => <RecommendationCard key={recommendation._id ?? recommendation.title} recommendation={recommendation} />)}
        </div>
        <p className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">{analysis.notes}</p>
      </CardContent>
    </Card>
  );
}

function DiseaseEmptyState() {
  return (
    <Card>
      <CardContent className="grid min-h-[520px] place-items-center p-8 text-center">
        <div>
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-emerald-700"><ImagePlus className="h-10 w-10" /></div>
          <h2 className="mt-5 text-2xl font-semibold text-slate-950">No report yet</h2>
          <p className="mt-2 max-w-md text-sm text-slate-500">Upload clear leaf, stem or fruit images. The AI will return a cautious health report with uncertainty and treatment guidance.</p>
        </div>
      </CardContent>
    </Card>
  );
}

function HealthScoreCard({ score }) {
  const color = healthColor(score);
  return (
    <div className="rounded-3xl border border-slate-100 p-4">
      <div className="mx-auto h-28 w-28">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={[{ value: score }, { value: 100 - score }]} innerRadius={38} outerRadius={52} dataKey="value">
              <Cell fill={color} /><Cell fill="#f1f5f9" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="text-center text-2xl font-semibold text-slate-950">{score}%</p>
      <p className="text-center text-xs font-semibold uppercase text-slate-500">{healthLabel(score)}</p>
    </div>
  );
}

function SeverityBadge({ severity }) {
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${severityTone[severity] ?? severityTone.Medium}`}>{severity}</span>;
}

function TreatmentAccordion({ title, items = [] }) {
  return (
    <details className="rounded-3xl border border-slate-100 bg-white p-4" open={title === 'Symptoms'}>
      <summary className="cursor-pointer font-semibold text-slate-950">{title}</summary>
      <ul className="mt-3 space-y-2 text-sm text-slate-600">
        {items.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {item}</li>)}
      </ul>
    </details>
  );
}

function RecommendationCard({ recommendation }) {
  return (
    <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4">
      <p className="text-xs font-semibold uppercase text-emerald-700">{recommendation.category} · {recommendation.priority}</p>
      <h3 className="mt-2 font-semibold text-slate-950">{recommendation.title}</h3>
      <p className="mt-1 text-sm text-slate-600">{recommendation.description}</p>
      {recommendation.estimatedCost ? <p className="mt-2 text-sm font-semibold text-emerald-700">{formatCurrency(recommendation.estimatedCost)}</p> : null}
    </div>
  );
}

function Metric({ label, value }) {
  return <div className="rounded-3xl border border-slate-100 bg-white p-4"><p className="text-xs font-semibold uppercase text-slate-500">{label}</p><p className="mt-2 text-xl font-semibold text-slate-950">{value}</p></div>;
}

