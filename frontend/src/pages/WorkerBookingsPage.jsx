import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { useWorkerBookings } from '@/hooks/useWorkers.js';

export function WorkerBookingsPage() {
  const bookingsQuery = useWorkerBookings();
  const bookings = bookingsQuery.data?.bookings ?? [];
  return (
    <section className="page-shell space-y-6">
      <div className="rounded-[32px] border border-emerald-100 bg-white/90 p-6 shadow-sm"><p className="text-sm font-semibold uppercase text-emerald-600">Work schedule</p><h1 className="mt-2 text-3xl font-semibold">Worker bookings</h1></div>
      <div className="grid gap-4">{bookings.map((booking) => <Card key={booking._id}><CardContent className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center"><div><div className="flex flex-wrap gap-2"><h3 className="font-semibold">{booking.workTitle}</h3><Badge>{booking.status}</Badge></div><p className="mt-1 text-sm text-muted-foreground">₹{booking.agreedPayment?.totalAmount?.toLocaleString?.('en-IN') ?? 0} · {booking.numberOfWorkers} worker(s)</p></div><Button asChild variant="outline"><Link to={`/worker-bookings/${booking._id}`}>Open</Link></Button></CardContent></Card>)}</div>
    </section>
  );
}
