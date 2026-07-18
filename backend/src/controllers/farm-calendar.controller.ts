import type { Request, Response } from 'express';
import { createCalendarEvent, deleteCalendarEvent, listCalendarEvents, listPlanCalendar, updateCalendarEvent } from '@/services/farm-task.service.js';
import { sendSuccess } from '@/utils/api-response.js';
import type { CalendarQuery, CreateCalendarEventInput, UpdateCalendarEventInput } from '@/validators/farm-task.validator.js';

export async function listCalendarEventsController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Farm calendar fetched.', await listCalendarEvents(req.query as unknown as CalendarQuery, req.user!));
}

export async function listPlanCalendarController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Plan calendar fetched.', await listPlanCalendar(String(req.params.id), req.user!));
}

export async function createCalendarEventController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 201, 'Calendar event created.', await createCalendarEvent(req.body as CreateCalendarEventInput, req.user!));
}

export async function updateCalendarEventController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Calendar event updated.', await updateCalendarEvent(String(req.params.id), req.body as UpdateCalendarEventInput, req.user!));
}

export async function deleteCalendarEventController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Calendar event deleted.', await deleteCalendarEvent(String(req.params.id), req.user!));
}
