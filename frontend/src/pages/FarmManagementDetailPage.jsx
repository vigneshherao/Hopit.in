import { Link, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { useFarmManagementAssignment, useFarmProgressReports, useSubmitReportFeedback } from '@/hooks/useWorkers.js';

export function FarmManagementDetailPage() {
  const { id } = useParams();
  const assignmentQuery = useFarmManagementAssignment(id);
  const reportsQuery = useFarmProgressReports(id);
  const feedback = useSubmitReportFeedback();
  const assignment = assignmentQuery.data?.assignment;
  const reports = reportsQuery.data?.reports ?? [];

  if (!assignment) return <section className="page-shell"><Card><CardContent className="p-8 text-center">Loading farm management assignment...</CardContent></Card></section>;

  return (
    <section className="page-shell space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-[32px] border border-emerald-100 bg-white/90 p-6 shadow-sm lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-emerald-600">Managed farm</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">{assignment.landId?.title ?? 'Farm assignment'}</h1>
          <p className="mt-2 text-muted-foreground">{assignment.managerId?.name ?? 'Manager'} · {assignment.status}</p>
        </div>
        <Button asChild><Link to={`/farm-management/${assignment._id}/reports/new`}>New report</Link></Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Progress" value={`${assignment.currentProgressPercentage ?? 0}%`} />
        <Metric label="Frequency" value={assignment.reportingFrequency} />
        <Metric label="Budget" value={`₹${assignment.budget?.estimatedTotalCost?.toLocaleString?.('en-IN') ?? 0}`} />
        <Metric label="Reports" value={reports.length} />
      </div>

      <Card>
        <CardHeader><CardTitle>Progress reports</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {reports.map((report) => (
            <article key={report._id} className="rounded-3xl border border-emerald-100 p-4">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{report.title}</h3><Badge>{report.cropHealth}</Badge></div>
                  <p className="mt-1 text-sm text-muted-foreground">{new Date(report.reportDate).toLocaleDateString('en-IN')} · {report.progressPercentage}% complete</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={feedback.isPending}
                  onClick={() => feedback.mutate({ reportId: report._id, payload: { message: 'Reviewed by owner.' } })}
                >
                  Mark reviewed
                </Button>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{report.summary}</p>
              {report.ownerFeedback?.message ? <p className="mt-3 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-800">{report.ownerFeedback.message}</p> : null}
            </article>
          ))}
          {!reports.length ? <p className="rounded-3xl bg-slate-50 p-5 text-sm text-muted-foreground">No progress reports have been submitted yet.</p> : null}
        </CardContent>
      </Card>
    </section>
  );
}

function Metric({ label, value }) {
  return <Card><CardContent className="p-5"><p className="text-xs font-semibold uppercase text-emerald-600">{label}</p><p className="mt-2 text-xl font-semibold text-slate-950">{value}</p></CardContent></Card>;
}
