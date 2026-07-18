import { Router } from 'express';
import { z } from 'zod';
import { presenceController, teamPresenceController } from '@/controllers/presence.controller.js';
import { authenticate } from '@/middleware/auth.js';
import { validateRequest } from '@/middleware/validate-request.js';
import { asyncHandler } from '@/utils/async-handler.js';

const presenceParamSchema = z.object({ userId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB id.') });
const farmParamSchema = z.object({ farmId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB id.') });

export const presenceRouter = Router();

presenceRouter.use(authenticate);
presenceRouter.get('/team/:farmId', validateRequest({ params: farmParamSchema }), asyncHandler(teamPresenceController));
presenceRouter.get('/:userId', validateRequest({ params: presenceParamSchema }), asyncHandler(presenceController));
