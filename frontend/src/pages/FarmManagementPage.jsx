import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { useFarmManagementAssignments } from '@/hooks/useWorkers.js';

export function FarmManagementPage() {
  const assignmentsQuery = useFarmManagementAssignments();
  const assignments = assignmentsQuery.data?.assignments ?? [];

  return (
    <section className="page-shell space-y-6">
      <div className="rounded-[32px] border border-emerald-100 bg-white/90 p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase text-emerald-600">Farm management</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Operations and progress reports</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Follow long-term farm manager assignments, crop health, progress, next report dates, and owner feedback.</p>
      </div>

      {assignmentsQuery.isLoading ? <div className="h-72 animate-pulse rounded-3xl bg-emerald-50" /> : null}
      <div className="grid gap-4">
        {assignments.map((assignment) => (
          <Card key={assignment._id}>
            <CardContent className="flex flex-col justify-between gap-4 p-5 lg:flex-row lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-slate-950">{assignment.landId?.title ?? 'Managed land'}</h3>
                  <Badge>{assignment.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{assignment.managerId?.name ?? 'Assigned manager'} · {assignment.reportingFrequency} reports</p>
                <p className="mt-3 text-sm text-slate-600">{assignment.currentProgressPercentage ?? 0}% complete · Next report {formatDate(assignment.nextReportDueAt)}</p>
              </div>
              <Button asChild variant="outline"><Link to={`/farm-management/${assignment._id}`}>Open</Link></Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {!assignmentsQuery.isLoading && !assignments.length ? <Card><CardContent className="p-8 text-center text-muted-foreground">No farm-management assignments yet.</CardContent></Card> : null}
    </section>
  );
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString('en-IN') : 'not scheduled';
}
