import { z } from 'zod';
import { FARM_CALENDAR_REPEAT_TYPES, FARM_TASK_CATEGORIES, FARM_TASK_PRIORITIES, FARM_TASK_STATUSES } from '@/constants/farm-task.constants.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB ID.');

export const farmTaskIdParamSchema = z.object({ id: objectId });
export const farmPlanTaskParamSchema = z.object({ id: objectId });

export const farmTaskQuerySchema = z.object({
  farmPlanId: objectId.optional(),
  status: z.enum(FARM_TASK_STATUSES).optional(),
  category: z.enum(FARM_TASK_CATEGORIES).optional(),
  assignedWorker: objectId.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const createFarmTaskSchema = z.object({
  farmPlanId: objectId,
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().max(2000).optional(),
  category: z.enum(FARM_TASK_CATEGORIES),
  priority: z.enum(FARM_TASK_PRIORITIES).default('Medium'),
  status: z.enum(FARM_TASK_STATUSES).default('Pending'),
  assignedWorker: objectId.optional(),
  assignedWorkerTeam: objectId.optional(),
  estimatedDuration: z.coerce.number().min(0).optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  dependencies: z.array(objectId).default([]),
  attachments: z.array(z.string().url()).default([]),
  notes: z.string().trim().max(2000).optional(),
});

export const updateFarmTaskSchema = createFarmTaskSchema.omit({ farmPlanId: true }).partial().extend({
  progress: z.coerce.number().min(0).max(100).optional(),
});

export const reassignTaskSchema = z.object({
  assignedWorker: objectId.optional(),
  assignedWorkerTeam: objectId.optional(),
});

export const calendarQuerySchema = z.object({
  farmPlanId: objectId.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const createCalendarEventSchema = z.object({
  farmPlanId: objectId,
  taskId: objectId.optional(),
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().max(2000).optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  allDay: z.boolean().default(true),
  eventColor: z.string().trim().max(40).default('#059669'),
  notificationEnabled: z.boolean().default(true),
  repeatType: z.enum(FARM_CALENDAR_REPEAT_TYPES).default('none'),
});

export const updateCalendarEventSchema = createCalendarEventSchema.partial();

export type CreateFarmTaskInput = z.infer<typeof createFarmTaskSchema>;
export type UpdateFarmTaskInput = z.infer<typeof updateFarmTaskSchema>;
export type FarmTaskQuery = z.infer<typeof farmTaskQuerySchema>;
export type ReassignTaskInput = z.infer<typeof reassignTaskSchema>;
export type CalendarQuery = z.infer<typeof calendarQuerySchema>;
export type CreateCalendarEventInput = z.infer<typeof createCalendarEventSchema>;
export type UpdateCalendarEventInput = z.infer<typeof updateCalendarEventSchema>;
