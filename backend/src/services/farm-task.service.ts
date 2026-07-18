import { FarmCalendarEventModel } from '@/models/farm-calendar-event.model.js';
import { FarmPlanModel, type FarmPlanDocument } from '@/models/farm-plan.model.js';
import { FarmTaskModel, type FarmTaskDocument } from '@/models/farm-task.model.js';
import { NotificationModel } from '@/models/notification.model.js';
import { WorkerTeamModel } from '@/models/worker-team.model.js';
import type { AuthenticatedUser } from '@/types/http.js';
import { AppError } from '@/utils/app-error.js';
import type { CalendarQuery, CreateCalendarEventInput, CreateFarmTaskInput, FarmTaskQuery, ReassignTaskInput, UpdateCalendarEventInput, UpdateFarmTaskInput } from '@/validators/farm-task.validator.js';

const categoryColor: Record<string, string> = {
  Harvesting: '#f59e0b',
  Irrigation: '#0ea5e9',
  Fertilizer: '#7c3aed',
  'Pesticide Spray': '#ef4444',
  Sowing: '#059669',
};

export async function generateTasksForFarmPlan(plan: FarmPlanDocument) {
  const existing = await FarmTaskModel.countDocuments({ farmPlanId: plan._id });
  if (existing) return;
  const taskInputs = buildTaskSchedule(plan);
  const createdTasks: FarmTaskDocument[] = [];

  for (const input of taskInputs) {
    const dependencies = createdTasks
      .filter((task) => input.dependsOnCategories?.includes(task.category))
      .map((task) => task._id);
    const task = await FarmTaskModel.create({
      farmPlanId: plan._id,
      landId: plan.landId,
      ownerId: plan.ownerId,
      title: input.title,
      description: input.description,
      category: input.category,
      priority: input.priority,
      status: 'Scheduled',
      estimatedDuration: input.estimatedDuration,
      startDate: addDays(plan.startDate, input.day),
      endDate: addDays(plan.startDate, input.day + Math.max(input.estimatedDuration ?? 1, 1) - 1),
      dependencies,
      attachments: [],
    });
    createdTasks.push(task);
    await createEventForTask(task);
  }
}

export async function listFarmTasks(query: FarmTaskQuery, user: AuthenticatedUser) {
  const filter = await taskAccessFilter(user);
  if (query.farmPlanId) filter.farmPlanId = query.farmPlanId;
  if (query.status) filter.status = query.status;
  if (query.category) filter.category = query.category;
  if (query.assignedWorker) filter.assignedWorker = query.assignedWorker;
  if (query.from || query.to) filter.startDate = { ...(query.from ? { $gte: query.from } : {}), ...(query.to ? { $lte: query.to } : {}) };
  const tasks = await FarmTaskModel.find(filter).populate({ path: 'assignedWorker', select: 'name avatar role' }).sort({ startDate: 1 }).lean();
  return { tasks, board: buildBoard(tasks), widgets: buildWidgets(tasks) };
}

export async function listPlanTasks(planId: string, user: AuthenticatedUser) {
  await findPlanForTaskAccess(planId, user);
  const tasks = await FarmTaskModel.find({ farmPlanId: planId }).populate({ path: 'assignedWorker', select: 'name avatar role' }).sort({ startDate: 1 }).lean();
  return { tasks, board: buildBoard(tasks), widgets: buildWidgets(tasks) };
}

export async function getFarmTask(id: string, user: AuthenticatedUser) {
  const task = await findTaskForAccess(id, user);
  return { task };
}

export async function createFarmTask(input: CreateFarmTaskInput, user: AuthenticatedUser) {
  const plan = await findPlanForTaskAccess(input.farmPlanId, user, true);
  await validateDependencyOrder(input.startDate, input.dependencies);
  const task = await FarmTaskModel.create({ ...input, landId: plan.landId, ownerId: plan.ownerId });
  await createEventForTask(task);
  await notifyAssignment(task, 'Worker Assigned');
  return { task };
}

export async function updateFarmTask(id: string, input: UpdateFarmTaskInput, user: AuthenticatedUser) {
  const task = await findTaskForAccess(id, user, true);
  if (input.dependencies) await validateDependencyOrder(input.startDate ?? task.startDate, input.dependencies);
  Object.assign(task, input);
  await task.save();
  await syncEventForTask(task);
  return { task };
}

export async function deleteFarmTask(id: string, user: AuthenticatedUser) {
  const task = await findTaskForAccess(id, user, true);
  await FarmCalendarEventModel.deleteMany({ taskId: task._id });
  await FarmTaskModel.deleteOne({ _id: task._id });
  return { deleted: true };
}

export async function startFarmTask(id: string, user: AuthenticatedUser) {
  const task = await findTaskForAccess(id, user, true);
  task.status = 'In Progress';
  task.actualStart = task.actualStart ?? new Date();
  task.progress = Math.max(task.progress, 10);
  await task.save();
  await notifyOwner(task, "Today's Task", `${task.title} has started.`);
  return { task };
}

export async function completeFarmTask(id: string, user: AuthenticatedUser) {
  const task = await findTaskForAccess(id, user, true);
  await assertDependenciesCompleted(task);
  task.status = 'Completed';
  task.progress = 100;
  task.completedAt = new Date();
  task.actualEnd = new Date();
  await task.save();
  await updatePlanProgress(String(task.farmPlanId));
  await notifyOwner(task, 'Completed Task', `${task.title} is completed.`);
  return { task };
}

export async function cancelFarmTask(id: string, user: AuthenticatedUser) {
  const task = await findTaskForAccess(id, user, true);
  task.status = 'Cancelled';
  await task.save();
  await notifyOwner(task, 'Delayed Task', `${task.title} was cancelled.`);
  return { task };
}

export async function reassignFarmTask(id: string, input: ReassignTaskInput, user: AuthenticatedUser) {
  const task = await findTaskForAccess(id, user, true);
  const previousWorker = task.assignedWorker;
  task.assignedWorker = input.assignedWorker as never;
  task.assignedWorkerTeam = input.assignedWorkerTeam as never;
  await task.save();
  if (previousWorker) await notify(previousWorker, 'Worker Removed', `You were removed from ${task.title}.`, task);
  await notifyAssignment(task, 'Worker Assigned');
  return { task };
}

export async function listCalendarEvents(query: CalendarQuery, user: AuthenticatedUser) {
  const planIds = await accessiblePlanIds(user);
  const filter: Record<string, unknown> = user.role === 'admin' ? {} : { farmPlanId: { $in: planIds } };
  if (query.farmPlanId) filter.farmPlanId = query.farmPlanId;
  if (query.from || query.to) filter.startDate = { ...(query.from ? { $gte: query.from } : {}), ...(query.to ? { $lte: query.to } : {}) };
  const events = await FarmCalendarEventModel.find(filter).sort({ startDate: 1 }).lean();
  return { events };
}

export async function listPlanCalendar(planId: string, user: AuthenticatedUser) {
  await findPlanForTaskAccess(planId, user);
  const events = await FarmCalendarEventModel.find({ farmPlanId: planId }).sort({ startDate: 1 }).lean();
  return { events };
}

export async function createCalendarEvent(input: CreateCalendarEventInput, user: AuthenticatedUser) {
  await findPlanForTaskAccess(input.farmPlanId, user, true);
  const event = await FarmCalendarEventModel.create(input);
  return { event };
}

export async function updateCalendarEvent(id: string, input: UpdateCalendarEventInput, user: AuthenticatedUser) {
  const event = await findCalendarForAccess(id, user, true);
  Object.assign(event, input);
  await event.save();
  if (event.taskId && (input.startDate || input.endDate)) {
    await FarmTaskModel.updateOne({ _id: event.taskId }, { $set: { startDate: event.startDate, endDate: event.endDate } });
  }
  return { event };
}

export async function deleteCalendarEvent(id: string, user: AuthenticatedUser) {
  const event = await findCalendarForAccess(id, user, true);
  await FarmCalendarEventModel.deleteOne({ _id: event._id });
  return { deleted: true };
}

async function findPlanForTaskAccess(planId: string, user: AuthenticatedUser, write = false) {
  const plan = await FarmPlanModel.findById(planId);
  if (!plan) throw new AppError('Farm plan not found.', 404);
  if (user.role === 'admin') return plan;
  if (String(plan.ownerId) === user.id) return plan;
  if (write) throw new AppError('You cannot edit tasks for this plan.', 403);
  throw new AppError('Farm plan not found.', 404);
}

async function findTaskForAccess(id: string, user: AuthenticatedUser, write = false) {
  const task = await FarmTaskModel.findById(id);
  if (!task) throw new AppError('Farm task not found.', 404);
  if (user.role === 'admin' || String(task.ownerId) === user.id || String(task.assignedWorker ?? '') === user.id) return task;
  if (task.assignedWorkerTeam && (await isTeamMember(String(task.assignedWorkerTeam), user.id))) return task;
  if (write) throw new AppError('You cannot edit this task.', 403);
  throw new AppError('Farm task not found.', 404);
}

async function findCalendarForAccess(id: string, user: AuthenticatedUser, write = false) {
  const event = await FarmCalendarEventModel.findById(id);
  if (!event) throw new AppError('Calendar event not found.', 404);
  await findPlanForTaskAccess(String(event.farmPlanId), user, write);
  return event;
}

async function taskAccessFilter(user: AuthenticatedUser) {
  if (user.role === 'admin') return {} as Record<string, unknown>;
  if (user.role === 'worker') return { assignedWorker: user.id } as Record<string, unknown>;
  return { ownerId: user.id } as Record<string, unknown>;
}

async function accessiblePlanIds(user: AuthenticatedUser) {
  if (user.role === 'admin') return [];
  const plans = await FarmPlanModel.find({ ownerId: user.id }).select('_id').lean();
  return plans.map((plan) => plan._id);
}

async function validateDependencyOrder(startDate: Date, dependencyIds: string[]) {
  if (!dependencyIds.length) return;
  const dependencies = await FarmTaskModel.find({ _id: { $in: dependencyIds } });
  if (dependencies.some((task) => task.startDate > startDate)) throw new AppError('Task dependencies must start before the dependent task.', 400);
}

async function assertDependenciesCompleted(task: FarmTaskDocument) {
  if (!task.dependencies.length) return;
  const incomplete = await FarmTaskModel.findOne({ _id: { $in: task.dependencies }, status: { $ne: 'Completed' } });
  if (incomplete) throw new AppError(`Complete dependency first: ${incomplete.title}.`, 400);
}

async function updatePlanProgress(planId: string) {
  const [total, completed] = await Promise.all([
    FarmTaskModel.countDocuments({ farmPlanId: planId, status: { $ne: 'Cancelled' } }),
    FarmTaskModel.countDocuments({ farmPlanId: planId, status: 'Completed' }),
  ]);
  const percentage = total ? Math.round((completed / total) * 100) : 0;
  await FarmPlanModel.updateOne({ _id: planId }, { $set: { 'progress.percentage': percentage, 'progress.updatedAt': new Date() } });
}

async function createEventForTask(task: FarmTaskDocument) {
  return FarmCalendarEventModel.create({
    farmPlanId: task.farmPlanId,
    taskId: task._id,
    title: task.title,
    description: task.description,
    startDate: task.startDate,
    endDate: task.endDate,
    allDay: true,
    eventColor: categoryColor[task.category] ?? '#059669',
    notificationEnabled: true,
    repeatType: 'none',
  });
}

async function syncEventForTask(task: FarmTaskDocument) {
  await FarmCalendarEventModel.updateOne(
    { taskId: task._id },
    { $set: { title: task.title, description: task.description, startDate: task.startDate, endDate: task.endDate, eventColor: categoryColor[task.category] ?? '#059669' } },
    { upsert: true },
  );
}

async function isTeamMember(teamId: string, userId: string) {
  return Boolean(await WorkerTeamModel.exists({ _id: teamId, 'members.workerId': userId, 'members.status': 'active' }));
}

async function notifyAssignment(task: FarmTaskDocument, type: string) {
  if (task.assignedWorker) await notify(task.assignedWorker, type, `You are assigned to ${task.title}.`, task);
}

async function notifyOwner(task: FarmTaskDocument, type: string, message: string) {
  await notify(task.ownerId, type, message, task);
}

async function notify(userId: unknown, type: string, message: string, task: FarmTaskDocument) {
  await NotificationModel.create({ userId, type, title: type, message, data: { taskId: task._id, farmPlanId: task.farmPlanId }, isRead: false });
}

function buildTaskSchedule(plan: FarmPlanDocument) {
  const recommendation = plan.AIRecommendation as { timeline?: { day: number; stage: string; activity: string; expectedCost?: number }[] };
  const timelineTasks = (recommendation.timeline ?? []).map((item) => ({
    day: Math.max(0, Math.round(item.day)),
    title: item.activity,
    description: item.stage,
    category: categoryFromText(`${item.stage} ${item.activity}`),
    priority: priorityFromDay(item.day, plan.farmDurationDays),
    estimatedDuration: 1,
  }));

  const fallback = [
    [1, 'Land Cleaning', 'Land Preparation'],
    [3, 'Ploughing', 'Ploughing'],
    [5, 'Rotavator', 'Rotavator'],
    [7, 'Seed Purchase', 'Seed Purchase'],
    [8, 'Seed Treatment', 'Seed Treatment'],
    [10, 'Sowing', 'Sowing'],
    [14, 'First Irrigation', 'Irrigation'],
    [20, 'Fertilizer', 'Fertilizer'],
    [25, 'Disease Inspection', 'Disease Monitoring'],
    [40, 'Second Fertilizer', 'Fertilizer'],
    [Math.max(plan.farmDurationDays - 15, 45), 'Harvest Preparation', 'Inspection'],
    [Math.max(plan.farmDurationDays - 2, 50), 'Harvest', 'Harvesting'],
    [Math.max(plan.farmDurationDays - 1, 51), 'Packing', 'Packing'],
    [plan.farmDurationDays, 'Transport', 'Transportation'],
  ].map(([day, title, category]) => ({ day: Number(day), title: String(title), description: `${title} for ${plan.selectedCrop}`, category: category as string, priority: category === 'Harvesting' ? 'Critical' : 'Medium', estimatedDuration: 1 }));

  const all = [...fallback, ...timelineTasks]
    .sort((a, b) => a.day - b.day)
    .filter((task, index, tasks) => tasks.findIndex((item) => item.title === task.title && item.day === task.day) === index)
    .slice(0, 120);

  return all.map((task) => ({
    ...task,
    dependsOnCategories: dependenciesForCategory(task.category),
  }));
}

function categoryFromText(value: string) {
  const lower = value.toLowerCase();
  if (lower.includes('harvest')) return 'Harvesting';
  if (lower.includes('fertil')) return 'Fertilizer';
  if (lower.includes('irrig') || lower.includes('water')) return 'Irrigation';
  if (lower.includes('pest') || lower.includes('disease')) return 'Disease Monitoring';
  if (lower.includes('sow') || lower.includes('transplant')) return lower.includes('transplant') ? 'Transplanting' : 'Sowing';
  if (lower.includes('seed')) return 'Seed Purchase';
  if (lower.includes('pack')) return 'Packing';
  if (lower.includes('transport')) return 'Transportation';
  return 'Custom';
}

function dependenciesForCategory(category: string) {
  if (['Sowing', 'Transplanting'].includes(category)) return ['Land Preparation', 'Ploughing', 'Rotavator'];
  if (['Irrigation'].includes(category)) return ['Land Preparation'];
  if (['Fertilizer', 'Organic Fertilizer', 'Chemical Fertilizer', 'Micronutrients', 'Pesticide Spray', 'Disease Monitoring', 'Weeding', 'Pruning'].includes(category)) return ['Sowing', 'Transplanting'];
  if (['Harvesting', 'Packing', 'Storage', 'Transportation', 'Sales'].includes(category)) return ['Sowing', 'Transplanting'];
  return [];
}

function priorityFromDay(day: number, duration: number) {
  if (day >= duration - 7) return 'High';
  if (day <= 10) return 'High';
  return 'Medium';
}

function buildBoard(tasks: { status: string }[]) {
  const columns = ['Pending', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'];
  return Object.fromEntries(columns.map((status) => [status, tasks.filter((task) => task.status === status)]));
}

function buildWidgets(tasks: { status: string; startDate: Date; endDate: Date; category: string }[]) {
  const todayStart = startOfDay(new Date());
  const todayEnd = addDays(todayStart, 1);
  const weekEnd = addDays(todayStart, 7);
  const total = tasks.length || 1;
  return {
    today: tasks.filter((task) => new Date(task.startDate) >= todayStart && new Date(task.startDate) < todayEnd).length,
    thisWeek: tasks.filter((task) => new Date(task.startDate) >= todayStart && new Date(task.startDate) <= weekEnd).length,
    overdue: tasks.filter((task) => new Date(task.endDate) < todayStart && !['Completed', 'Cancelled'].includes(task.status)).length,
    upcomingHarvest: tasks.filter((task) => task.category === 'Harvesting' && new Date(task.startDate) >= todayStart).slice(0, 3),
    completedPercentage: Math.round((tasks.filter((task) => task.status === 'Completed').length / total) * 100),
    pendingPercentage: Math.round((tasks.filter((task) => ['Pending', 'Scheduled'].includes(task.status)).length / total) * 100),
    delayedTasks: tasks.filter((task) => task.status === 'Delayed').length,
    completedTasks: tasks.filter((task) => task.status === 'Completed').length,
  };
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}
