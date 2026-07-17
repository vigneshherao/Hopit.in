import { z } from 'zod';

export const mongoIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB id.'),
});
