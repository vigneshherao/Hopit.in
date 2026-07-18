import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from '@/types/http.js';
import { hasAdminPermission } from '@/utils/adminPermission.util.js';
import { AppError } from '@/utils/app-error.js';

export function requireAnyPermission(...permissions: string[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.admin) return next(new AppError('Admin access is required.', 403));
    const allowed = permissions.find((permission) => hasAdminPermission(req.admin!, permission));
    if (!allowed) return next(new AppError('You do not have permission to perform this admin action.', 403));
    req.adminPermission = allowed;
    next();
  };
}
