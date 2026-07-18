import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from '@/types/http.js';
import { AppError } from '@/utils/app-error.js';

export function requireAdminRole(...roleSlugs: string[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.admin) return next(new AppError('Admin access is required.', 403));
    if (!req.admin.roles.some((role) => roleSlugs.includes(role.slug))) return next(new AppError('Required admin role is missing.', 403));
    next();
  };
}
