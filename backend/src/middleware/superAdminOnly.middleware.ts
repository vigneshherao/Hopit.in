import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from '@/types/http.js';
import { AppError } from '@/utils/app-error.js';

export function superAdminOnly(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  if (!req.admin?.isSuperAdmin) return next(new AppError('Super admin access is required.', 403));
  next();
}
