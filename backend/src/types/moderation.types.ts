import type { z } from 'zod';
import type { moderationDecisionSchema, moderationQueueQuerySchema } from '@/validators/moderation.validator.js';

export type ModerationQueueQuery = z.infer<typeof moderationQueueQuerySchema>;
export type ModerationDecisionInput = z.infer<typeof moderationDecisionSchema>;
