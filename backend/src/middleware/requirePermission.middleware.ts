import type { NextFunction, Response } from 'express';
import type { ADMIN_PERMISSIONS } from '@/constants/admin.constants.js';
import type { AuthenticatedRequest } from '@/types/http.js';
import { hasAdminPermission } from '@/utils/adminPermission.util.js';
import { AppError } from '@/utils/app-error.js';

export function requirePermission(permission: (typeof ADMIN_PERMISSIONS)[keyof typeof ADMIN_PERMISSIONS]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.admin) return next(new AppError('Admin access is required.', 403));
    if (!hasAdminPermission(req.admin, permission)) return next(new AppError('You do not have permission to perform this admin action.', 403));
    req.adminPermission = permission;
    next();
  };
}

declare module '@/types/http.js' {
  interface AuthenticatedRequest {
    adminPermission?: string;
  }
}
