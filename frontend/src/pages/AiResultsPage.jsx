import { Send, Sparkles, Sprout } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { useAIChat, useAIHistoryItem } from '@/hooks/useAI.js';
import { formatMoneyRange, scoreColor } from '@/utils/aiData.js';

export function AiResultsPage() {
  const { id } = useParams();
  const historyQuery = useAIHistoryItem(id);
  const history = historyQuery.data?.history;
  const response = history?.response;
  const recommendations = response?.recommendations ?? [];
  const topCrop = recommendations[0];

  if (historyQuery.isLoading) return <section className="page-shell"><div className="h-96 animate-pulse rounded-3xl bg-emerald-50" /></section>;
  if (!history) return <section className="page-shell"><Card><CardContent className="p-8 text-center text-muted-foreground">AI result not found.</CardContent></Card></section>;

  return (
    <section className="page-shell space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-[36px] border border-emerald-100 bg-white p-7 shadow-xl shadow-emerald-900/5 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-emerald-600">AI Results</p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-950">{response.topRecommendedCrop ?? 'Land recommendation'}</h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">{response.summary ?? response.explanation}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild><Link to="/farm-jobs/new">Start farm plan</Link></Button>
          <Button asChild variant="outline"><Link to="/workers">View matching workers</Link></Button>
          {history.landId?.slug ? <Button asChild variant="outline"><Link to={`/lands/${history.landId.slug}`}>Return to land</Link></Button> : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Health score" value={`${topCrop?.suitabilityScore ?? response.landHealthScore ?? 0}/100`} />
        <Metric label="Risk" value={response.riskLevel ?? topCrop?.majorRisks?.[0] ?? 'Moderate'} />
        <Metric label="Investment" value={formatMoneyRange(topCrop?.investmentRange)} />
        <Metric label="ROI" value={topCrop ? `${topCrop.roiRange.minimum}% - ${topCrop.roiRange.maximum}%` : 'Not available'} />
      </div>

      {topCrop ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader><CardTitle>Crop comparison</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Chart title="Suitability" items={recommendations.map((crop) => ({ label: crop.cropName, value: crop.suitabilityScore }))} />
              <Chart title="Profit potential" items={recommendations.map((crop) => ({ label: crop.cropName, value: crop.expectedProfitRange.maximum }))} normalizeMoney />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead><tr className="border-b text-muted-foreground"><th className="py-3">Crop</th><th>Score</th><th>Duration</th><th>Water</th><th>Revenue</th><th>Profit</th><th>Market</th></tr></thead>
                  <tbody>{recommendations.map((crop) => <tr key={crop.cropName} className="border-b border-emerald-50"><td className="py-3 font-semibold">{crop.cropName}</td><td>{crop.suitabilityScore}</td><td>{crop.estimatedDuration}</td><td>{crop.waterRequirement}</td><td>{formatMoneyRange(crop.expectedRevenueRange)}</td><td>{formatMoneyRange(crop.expectedProfitRange)}</td><td>{crop.marketDemand}</td></tr>)}</tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Top crop plan</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-3xl bg-emerald-50 p-5"><div className="flex items-center gap-2"><Sprout className="h-5 w-5 text-emerald-600" /><h3 className="font-semibold">{topCrop.cropName}</h3></div><p className="mt-2 text-sm leading-6 text-emerald-900">{topCrop.reason}</p></div>
              <PlanList title="Preparation checklist" items={topCrop.soilPreparation} />
              <PlanList title="Irrigation plan" items={topCrop.irrigationPlan} />
              <PlanList title="Fertilizer plan" items={topCrop.fertilizerPlan} />
              <PlanList title="Major risks" items={topCrop.majorRisks} danger />
              <p className="rounded-2xl bg-purple-50 p-4 text-sm text-purple-900">Labour requirement: {topCrop.labourRequirement}</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <AIChatPanel historyId={history._id} landId={history.landId?._id} />
    </section>
  );
}

function Metric({ label, value }) {
  return <Card><CardContent className="p-5"><p className="text-xs font-semibold uppercase text-emerald-600">{label}</p><p className="mt-2 text-xl font-semibold text-slate-950">{value}</p></CardContent></Card>;
}

function Chart({ title, items, normalizeMoney = false }) {
  const max = Math.max(...items.map((item) => Number(item.value) || 0), 1);
  return <div className="rounded-3xl border border-emerald-100 p-4"><h3 className="font-semibold">{title}</h3><div className="mt-4 space-y-3">{items.map((item) => <div key={item.label} className="grid gap-2"><div className="flex justify-between text-sm"><span>{item.label}</span><span>{normalizeMoney ? `₹${Number(item.value).toLocaleString('en-IN')}` : item.value}</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${scoreColor((Number(item.value) / max) * 100)}`} style={{ width: `${Math.max((Number(item.value) / max) * 100, 4)}%` }} /></div></div>)}</div></div>;
}

function PlanList({ title, items = [], danger = false }) {
  return <div><h3 className="font-semibold">{title}</h3><ul className="mt-2 space-y-2">{items.map((item) => <li key={item} className={`rounded-2xl p-3 text-sm ${danger ? 'bg-rose-50 text-rose-800' : 'bg-slate-50 text-slate-700'}`}>{item}</li>)}</ul></div>;
}

function AIChatPanel({ historyId, landId }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const chat = useAIChat();

  async function submit(event) {
    event.preventDefault();
    if (!message.trim()) return;
    const userMessage = message.trim();
    setMessages((items) => [...items, { role: 'user', content: userMessage }]);
    setMessage('');
    const result = await chat.mutateAsync({ historyId, landId, message: userMessage });
    setMessages((items) => [...items, { role: 'ai', content: result.response.answer }]);
  }

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-purple-600" /> Ask about this recommendation</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">{messages.map((item, index) => <div key={`${item.role}-${index}`} className={`max-w-3xl rounded-3xl p-4 text-sm ${item.role === 'ai' ? 'bg-emerald-50 text-emerald-950' : 'ml-auto bg-purple-50 text-purple-950'}`}>{item.content}</div>)}</div>
        {chat.error ? <p className="rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">{chat.error.response?.data?.message ?? chat.error.message}</p> : null}
        <form className="flex gap-2" onSubmit={submit}><Input value={message} maxLength={700} placeholder="Ask what to cultivate, investment, risk, water, or workers..." onChange={(event) => setMessage(event.target.value)} /><Button type="submit" disabled={chat.isPending} aria-label="Send AI chat"><Send className="h-4 w-4" /></Button></form>
        <div className="flex flex-wrap gap-2">{['What should I cultivate?', 'How much investment is needed?', 'What risks should I expect?', 'How many workers are required?'].map((question) => <Badge key={question} variant="secondary" className="cursor-pointer" onClick={() => setMessage(question)}>{question}</Badge>)}</div>
      </CardContent>
    </Card>
  );
}
