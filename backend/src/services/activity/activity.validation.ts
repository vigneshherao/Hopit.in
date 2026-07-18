import { z } from 'zod';

export const activityQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().trim().max(120).optional(),
  entityType: z.string().trim().max(80).optional(),
  action: z.string().trim().max(80).optional(),
  visibility: z.enum(['private', 'farm-team', 'agreement', 'public', 'admin']).optional(),
  date: z.enum(['today', 'yesterday', 'this-week', 'this-month']).optional(),
});
