import { useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { useCancelWorkerBooking, useUpdateBookingProgress, useWorkerBooking, useWorkerBookingAction } from '@/hooks/useWorkers.js';

export function WorkerBookingDetailPage() {
  const { id } = useParams();
  const bookingQuery = useWorkerBooking(id);
  const confirm = useWorkerBookingAction('confirm');
  const start = useWorkerBookingAction('start');
  const complete = useWorkerBookingAction('complete');
  const progress = useUpdateBookingProgress();
  const cancel = useCancelWorkerBooking();
  const booking = bookingQuery.data?.booking;

  if (!booking) return <section className="page-shell"><Card><CardContent className="p-8 text-center">Loading booking...</CardContent></Card></section>;

  return (
    <section className="page-shell">
      <Card className="mx-auto max-w-4xl">
        <CardHeader><div className="flex flex-wrap items-center gap-2"><CardTitle>{booking.workTitle}</CardTitle><Badge>{booking.status}</Badge></div></CardHeader>
        <CardContent className="space-y-5">
          <p className="leading-7 text-muted-foreground">{booking.workDescription}</p>
          <div className="grid gap-3 sm:grid-cols-3"><Metric label="Payment" value={`₹${booking.agreedPayment?.totalAmount ?? 0}`} /><Metric label="Progress" value={`${booking.progress?.percentage ?? 0}%`} /><Metric label="Workers" value={booking.numberOfWorkers} /></div>
          <div className="flex flex-wrap gap-2"><Button onClick={() => confirm.mutate(booking._id)}>Confirm</Button><Button variant="outline" onClick={() => start.mutate(booking._id)}>Start</Button><Button variant="outline" onClick={() => progress.mutate({ id: booking._id, payload: { percentage: 50 } })}>Set 50%</Button><Button onClick={() => complete.mutate(booking._id)}>Complete</Button><Button variant="destructive" onClick={() => cancel.mutate({ id: booking._id, payload: { reason: 'Cancelled from dashboard.' } })}>Cancel</Button></div>
        </CardContent>
      </Card>
    </section>
  );
}

function Metric({ label, value }) {
  return <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4"><p className="text-xs font-semibold uppercase text-emerald-600">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></div>;
}
