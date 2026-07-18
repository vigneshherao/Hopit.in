import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { useFarmCalendar, useUpdateCalendarEvent } from '@/hooks/useFarmTasks.js';
import { formatDate } from '@/utils/farmTaskData.js';

export function FarmCalendarPage() {
  const { id } = useParams();
  const [view, setView] = useState('month');
  const calendarQuery = useFarmCalendar(id);
  const updateEvent = useUpdateCalendarEvent();
  const events = calendarQuery.data?.events ?? [];
  const days = useMemo(() => buildDays(view), [view]);

  function moveEvent(eventId, date) {
    updateEvent.mutate({ id: eventId, payload: { startDate: date.toISOString(), endDate: date.toISOString() } });
  }

  return (
    <section className="page-shell space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-[36px] border border-emerald-100 bg-white p-7 shadow-xl shadow-emerald-900/5 lg:flex-row lg:items-end">
        <div><p className="text-sm font-semibold uppercase text-emerald-600">Farm Calendar</p><h1 className="mt-2 text-4xl font-semibold text-slate-950">Calendar and timeline</h1><p className="mt-2 text-muted-foreground">Month, week, day, and timeline views for generated farming activities.</p></div>
        <div className="flex flex-wrap gap-2">{['month', 'week', 'day', 'timeline'].map((item) => <Button key={item} variant={view === item ? 'default' : 'outline'} onClick={() => setView(item)}>{item}</Button>)}<Button asChild variant="outline"><Link to={`/farm-planner/${id}/tasks`}>Tasks</Link></Button></div>
      </div>

      {view === 'timeline' ? <Timeline events={events} /> : (
        <div className="grid gap-3 md:grid-cols-7">
          {days.map((day) => <CalendarDay key={day.toISOString()} day={day} events={events.filter((event) => sameDay(event.startDate, day))} onMove={moveEvent} />)}
        </div>
      )}
    </section>
  );
}

function CalendarDay({ day, events, onMove }) {
  return (
    <Card onDragOver={(event) => event.preventDefault()} onDrop={(event) => onMove(event.dataTransfer.getData('event-id'), day)} className="min-h-36">
      <CardContent className="p-3">
        <p className="text-xs font-semibold uppercase text-emerald-600">{day.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
        <div className="mt-3 space-y-2">{events.map((event) => <motion.div key={event._id} draggable onDragStart={(dragEvent) => dragEvent.dataTransfer.setData('event-id', event._id)} whileHover={{ scale: 1.02 }} className="rounded-2xl p-2 text-xs text-white shadow-sm" style={{ backgroundColor: event.eventColor }}>{event.title}</motion.div>)}</div>
      </CardContent>
    </Card>
  );
}

function Timeline({ events }) {
  return <Card><CardContent className="space-y-3 p-5">{events.map((event) => <motion.div key={event._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-2 rounded-3xl border border-emerald-100 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-semibold text-slate-950">{event.title}</h3><p className="text-sm text-muted-foreground">{event.description}</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700">{formatDate(event.startDate)}</span></motion.div>)}</CardContent></Card>;
}

function buildDays(view) {
  const today = new Date();
  if (view === 'day') return [today];
  const start = view === 'week' ? startOfWeek(today) : startOfWeek(startOfMonth(today));
  const count = view === 'week' ? 7 : 42;
  const monthEnd = endOfMonth(today);
  return Array.from({ length: count }, (_, index) => addDays(start, index)).filter((day) => view !== 'month' || day <= addDays(monthEnd, 14));
}

function sameDay(value, day) {
  return new Date(value).toDateString() === day.toDateString();
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(date) {
  const next = new Date(date);
  next.setDate(next.getDate() - next.getDay());
  next.setHours(0, 0, 0, 0);
  return next;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
