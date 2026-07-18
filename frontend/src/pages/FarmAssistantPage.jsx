import { Bot, Clipboard, Download, FileText, Loader2, Send, Sparkles } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { useAssistantChat, useFarmInsights, useForecast, useGenerateReport } from '@/hooks/useAssistant.js';
import { useFarmDashboard } from '@/hooks/useFarmPlanner.js';
import { downloadTextFile, formatAssistantDate, healthTone, suggestedAssistantQuestions } from '@/utils/assistantData.js';
import { formatCurrency } from '@/utils/farmPlannerData.js';

export function FarmAssistantPage() {
  const { id } = useParams();
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef(null);
  const dashboardQuery = useFarmDashboard(id);
  const insightsQuery = useFarmInsights(id);
  const forecastQuery = useForecast(id);
  const chatMutation = useAssistantChat();
  const reportMutation = useGenerateReport();
  const plan = dashboardQuery.data?.plan;
  const health = insightsQuery.data?.health;

  const forecastChart = useMemo(
    () =>
      (forecastQuery.data?.forecasts ?? []).map((item) => ({
        name: item.forecastType,
        confidence: item.confidence,
      })),
    [forecastQuery.data],
  );

  async function sendQuestion(question = draft) {
    const clean = question.trim();
    if (!clean || chatMutation.isPending) return;
    const optimistic = { sender: 'user', content: clean, createdAt: new Date().toISOString() };
    setMessages((current) => [...current, optimistic]);
    setDraft('');
    const result = await chatMutation.mutateAsync({ farmPlanId: id, conversationId, message: clean });
    setConversationId(result.conversation._id);
    setMessages(result.messages);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
  }

  async function generateReport(reportType) {
    const result = await reportMutation.mutateAsync({ farmPlanId: id, reportType, format: 'markdown' });
    const report = result.report;
    const body = [`# ${report.title}`, '', report.executiveSummary, '', ...report.sections.flatMap((section) => [`## ${section.title}`, section.content, '']), '## Recommendations', ...report.recommendations.map((item) => `- ${item}`)].join('\n');
    downloadTextFile(`${report.reportType}-${id}.md`, body);
  }

  async function copyLastAnswer() {
    const lastAnswer = [...messages].reverse().find((message) => message.sender === 'assistant');
    if (!lastAnswer) return;
    await navigator.clipboard.writeText(lastAnswer.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  if (dashboardQuery.isLoading) return <section className="page-shell"><div className="h-96 animate-pulse rounded-[36px] bg-emerald-50" /></section>;

  return (
    <section className="page-shell space-y-6">
      <div className="overflow-hidden rounded-[40px] border border-emerald-100 bg-white shadow-2xl shadow-emerald-900/5">
        <div className="grid gap-6 bg-[radial-gradient(circle_at_top_left,#dcfce7,transparent_35%),radial-gradient(circle_at_top_right,#ede9fe,transparent_30%)] p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase text-emerald-700"><Sparkles className="h-4 w-4" /> AI Farm Assistant</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Ask what your farm needs next</h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              The assistant reads your farm plan, task board, calendar, budget estimates, harvest timeline and AI recommendations before answering.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild variant="outline"><Link to={`/farm-planner/${id}`}>Dashboard</Link></Button>
              <Button asChild variant="outline"><Link to={`/farm-planner/${id}/tasks`}>Tasks</Link></Button>
              <Button asChild variant="outline"><Link to={`/farm-planner/${id}/insights`}>Insights</Link></Button>
            </div>
          </div>
          <div className="rounded-[32px] border border-white/80 bg-white/75 p-5 shadow-xl shadow-emerald-900/5 backdrop-blur">
            <p className="text-sm font-semibold text-slate-500">Farm health</p>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-5xl font-semibold text-slate-950">{health?.score ?? plan?.progress?.percentage ?? 0}</p>
                <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${healthTone[health?.label] ?? 'bg-slate-100 text-slate-700'}`}>{health?.label ?? 'Calculating'}</span>
              </div>
              <Bot className="h-16 w-16 text-emerald-600" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <MiniMetric label="Crop" value={plan?.selectedCrop} />
              <MiniMetric label="Harvest" value={formatAssistantDate(plan?.expectedHarvestDate)} />
              <MiniMetric label="Profit" value={formatCurrency(plan?.estimatedProfit ?? 0)} />
              <MiniMetric label="ROI" value={`${plan?.expectedROI ?? 0}%`} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-slate-50/70">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>Conversation</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyLastAnswer}><Clipboard className="h-4 w-4" /> {copied ? 'Copied' : 'Copy'}</Button>
                <Button variant="outline" size="sm" onClick={() => generateReport('weekly')} disabled={reportMutation.isPending}><FileText className="h-4 w-4" /> Weekly report</Button>
                <Button variant="outline" size="sm" onClick={() => generateReport('monthly')} disabled={reportMutation.isPending}><Download className="h-4 w-4" /> Monthly</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[560px] overflow-y-auto p-5">
              {messages.length === 0 ? (
                <div className="grid h-full place-items-center text-center">
                  <div>
                    <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Bot className="h-10 w-10" /></div>
                    <h2 className="mt-5 text-2xl font-semibold text-slate-950">How is the farm doing today?</h2>
                    <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Start with a suggested question or ask anything about tasks, harvest, workers, cost, ROI or risk.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => <ChatBubble key={message._id ?? `${message.sender}-${message.createdAt}`} message={message} />)}
                  {chatMutation.isPending ? <TypingBubble /> : null}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>
            <div className="border-t bg-white p-4">
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                {suggestedAssistantQuestions.slice(0, 6).map((question) => (
                  <button key={question} type="button" onClick={() => sendQuestion(question)} className="shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100">
                    {question}
                  </button>
                ))}
              </div>
              <form
                className="flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  sendQuestion();
                }}
              >
                <Input value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={1200} placeholder="Ask about profit, irrigation, workers, harvest or delayed tasks..." />
                <Button disabled={chatMutation.isPending || !draft.trim()}><Send className="h-4 w-4" /> Send</Button>
              </form>
              {chatMutation.error ? <p className="mt-2 text-sm text-red-600">{chatMutation.error.response?.data?.message ?? 'Assistant could not answer right now.'}</p> : null}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Forecast confidence</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecastChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="confidence" fill="#059669" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Smart insights</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {(insightsQuery.data?.insights ?? []).slice(0, 5).map((insight) => (
                <div key={insight._id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <p className="font-semibold text-slate-900">{insight.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{insight.recommendation}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function MiniMetric({ label, value }) {
  return <div className="rounded-2xl bg-white p-3"><p className="text-xs font-semibold uppercase text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-950">{value ?? '-'}</p></div>;
}

function ChatBubble({ message }) {
  const isUser = message.sender === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[82%] rounded-[28px] px-5 py-4 text-sm shadow-sm ${isUser ? 'bg-emerald-600 text-white' : 'border border-emerald-100 bg-white text-slate-700'}`}>
        <MarkdownLite text={message.content} />
      </div>
    </div>
  );
}

function MarkdownLite({ text }) {
  return (
    <div className="space-y-2">
      {String(text)
        .split('\n')
        .filter(Boolean)
        .map((line) => (
          <p key={line} className="leading-6">{line.replace(/^[-*]\s/, '• ')}</p>
        ))}
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-3 text-sm text-emerald-700 shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin" /> Thinking through the farm context...
      </div>
    </div>
  );
}

