import { motion } from 'framer-motion';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CheckCircle2, Clock, Copy, Plus, Trash2, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { useCancelTask, useCompleteTask, useCreateTask, useDeleteTask, useStartTask, useTaskBoard, useUpdateTask } from '@/hooks/useFarmTasks.js';
import { formatDate, priorityTone, statusTone, taskCategories, taskPriorities, taskStatuses } from '@/utils/farmTaskData.js';

export function FarmTasksPage() {
  const { id } = useParams();
  const boardQuery = useTaskBoard(id);
  const updateTask = useUpdateTask();
  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();
  const completeTask = useCompleteTask();
  const startTask = useStartTask();
  const cancelTask = useCancelTask();
  const [draft, setDraft] = useState({ title: '', category: 'Custom', priority: 'Medium' });
  const tasks = boardQuery.data?.tasks ?? [];
  const board = boardQuery.data?.board ?? {};
  const widgets = boardQuery.data?.widgets ?? {};

  function onDrop(status, event) {
    const taskId = event.dataTransfer.getData('task-id');
    if (taskId) updateTask.mutate({ id: taskId, payload: { status } });
  }

  function createDraftTask() {
    if (!draft.title.trim()) return;
    const today = new Date();
    createTask.mutate({
      farmPlanId: id,
      title: draft.title,
      category: draft.category,
      priority: draft.priority,
      status: 'Pending',
      startDate: today.toISOString(),
      endDate: today.toISOString(),
      dependencies: [],
      attachments: [],
    });
    setDraft({ title: '', category: 'Custom', priority: 'Medium' });
  }

  return (
    <section className="page-shell space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-[36px] border border-emerald-100 bg-white p-7 shadow-xl shadow-emerald-900/5 lg:flex-row lg:items-end">
        <div><p className="text-sm font-semibold uppercase text-emerald-600">Task Scheduler</p><h1 className="mt-2 text-4xl font-semibold text-slate-950">Farm execution board</h1><p className="mt-2 text-muted-foreground">Kanban, widgets, progress, dependency-aware completion, and calendar-linked task scheduling.</p></div>
        <div className="flex gap-2"><Button asChild variant="outline"><Link to={`/farm-planner/${id}`}>Dashboard</Link></Button><Button asChild><Link to={`/farm-planner/${id}/calendar`}>Calendar</Link></Button></div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Widget label="Today's Tasks" value={widgets.today ?? 0} />
        <Widget label="This Week" value={widgets.thisWeek ?? 0} />
        <Widget label="Overdue" value={widgets.overdue ?? 0} />
        <Widget label="Completed %" value={`${widgets.completedPercentage ?? 0}%`} />
        <Widget label="Pending %" value={`${widgets.pendingPercentage ?? 0}%`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_330px]">
        <div className="overflow-x-auto pb-2">
          <div className="grid min-w-[1120px] grid-cols-5 gap-4">
            {taskStatuses.map((status) => (
              <div key={status} data-testid={`task-column-${status}`} className="rounded-3xl border border-emerald-100 bg-white/80 p-3" onDragOver={(event) => event.preventDefault()} onDrop={(event) => onDrop(status, event)}>
                <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">{status}</h2><Badge variant="secondary">{board[status]?.length ?? 0}</Badge></div>
                <div className="space-y-3">
                  {(board[status] ?? []).map((task) => (
                    <TaskCard key={task._id} task={task} onStart={() => startTask.mutate(task._id)} onComplete={() => completeTask.mutate(task._id)} onCancel={() => cancelTask.mutate(task._id)} onDelete={() => deleteTask.mutate(task._id)} onDuplicate={() => createTask.mutate({ farmPlanId: id, title: `${task.title} copy`, category: task.category, priority: task.priority, status: 'Pending', startDate: task.startDate, endDate: task.endDate, dependencies: [], attachments: [] })} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Create task</CardTitle></CardHeader><CardContent className="space-y-3"><Input value={draft.title} placeholder="Task name" onChange={(event) => setDraft((value) => ({ ...value, title: event.target.value }))} /><select className="premium-select w-full" value={draft.category} onChange={(event) => setDraft((value) => ({ ...value, category: event.target.value }))}>{taskCategories.map((category) => <option key={category}>{category}</option>)}</select><select className="premium-select w-full" value={draft.priority} onChange={(event) => setDraft((value) => ({ ...value, priority: event.target.value }))}>{taskPriorities.map((priority) => <option key={priority}>{priority}</option>)}</select><Button className="w-full" onClick={createDraftTask}><Plus className="h-4 w-4" /> Add task</Button></CardContent></Card>
          <Card><CardHeader><CardTitle>Task completion</CardTitle></CardHeader><CardContent className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={taskStatuses.map((status) => ({ status, count: tasks.filter((task) => task.status === status).length }))}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="status" hide /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#059669" radius={[10, 10, 0, 0]} /></BarChart></ResponsiveContainer></CardContent></Card>
        </div>
      </div>
    </section>
  );
}

function TaskCard({ task, onStart, onComplete, onCancel, onDelete, onDuplicate }) {
  return (
    <motion.article layout draggable onDragStart={(event) => event.dataTransfer.setData('task-id', task._id)} whileHover={{ y: -3 }} className="rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2"><h3 className="font-semibold text-slate-950">{task.title}</h3><span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${priorityTone(task.priority)}`}>{task.priority}</span></div>
      <p className="mt-2 text-xs text-muted-foreground">{task.category}</p>
      <div className="mt-3 flex flex-wrap gap-2"><span className={`rounded-full px-2 py-1 text-xs ${statusTone(task.status)}`}>{task.status}</span><span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">{task.progress}%</span></div>
      <div className="mt-3 grid gap-1 text-xs text-slate-600"><span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(task.startDate)} - {formatDate(task.endDate)}</span><span className="flex items-center gap-1"><UserRound className="h-3 w-3" /> {task.assignedWorker?.name ?? 'Unassigned'}</span></div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><motion.div initial={{ width: 0 }} animate={{ width: `${task.progress}%` }} className="h-full bg-emerald-500" /></div>
      <div className="mt-3 flex flex-wrap gap-1"><Button size="sm" variant="outline" onClick={onStart}>Start</Button><Button size="sm" variant="outline" onClick={onComplete}><CheckCircle2 className="h-3 w-3" /></Button><Button size="sm" variant="outline" onClick={onDuplicate}><Copy className="h-3 w-3" /></Button><Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button><Button size="sm" variant="destructive" onClick={onDelete}><Trash2 className="h-3 w-3" /></Button></div>
    </motion.article>
  );
}

function Widget({ label, value }) {
  return <Card><CardContent className="p-4"><p className="text-xs font-semibold uppercase text-emerald-600">{label}</p><p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p></CardContent></Card>;
}
