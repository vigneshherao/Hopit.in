import { z } from 'zod';

export const weatherFarmQuerySchema = z.object({
  farmPlanId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid farm plan id.'),
});

export const weatherHistoryQuerySchema = weatherFarmQuerySchema.extend({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(14),
});

export const weatherRefreshSchema = z.object({
  farmPlanId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid farm plan id.'),
  force: z.coerce.boolean().default(false),
});

export type WeatherFarmQuery = z.infer<typeof weatherFarmQuerySchema>;
export type WeatherHistoryQuery = z.infer<typeof weatherHistoryQuerySchema>;
export type WeatherRefreshInput = z.infer<typeof weatherRefreshSchema>;

