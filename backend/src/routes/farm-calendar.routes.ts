import { Router } from 'express';
import { createCalendarEventController, deleteCalendarEventController, listCalendarEventsController, listPlanCalendarController, updateCalendarEventController } from '@/controllers/farm-calendar.controller.js';
import { authenticate } from '@/middleware/auth.js';
import { validateRequest } from '@/middleware/validate-request.js';
import { asyncHandler } from '@/utils/async-handler.js';
import { calendarQuerySchema, createCalendarEventSchema, farmPlanTaskParamSchema, farmTaskIdParamSchema, updateCalendarEventSchema } from '@/validators/farm-task.validator.js';

export const farmCalendarRouter = Router();

farmCalendarRouter.use(authenticate);
farmCalendarRouter.get('/', validateRequest({ query: calendarQuerySchema }), asyncHandler(listCalendarEventsController));
farmCalendarRouter.post('/', validateRequest({ body: createCalendarEventSchema }), asyncHandler(createCalendarEventController));
farmCalendarRouter.patch('/:id', validateRequest({ params: farmTaskIdParamSchema, body: updateCalendarEventSchema }), asyncHandler(updateCalendarEventController));
farmCalendarRouter.delete('/:id', validateRequest({ params: farmTaskIdParamSchema }), asyncHandler(deleteCalendarEventController));
farmCalendarRouter.get('/plans/:id/calendar', validateRequest({ params: farmPlanTaskParamSchema }), asyncHandler(listPlanCalendarController));
