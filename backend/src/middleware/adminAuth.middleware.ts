import type { NextFunction, Response } from 'express';
import { env } from '@/config/env.js';
import type { AuthenticatedRequest } from '@/types/http.js';
import { resolveAdminPermissions, type EffectiveAdmin } from '@/utils/adminPermission.util.js';
import { AppError } from '@/utils/app-error.js';

declare module '@/types/http.js' {
  interface AuthenticatedRequest {
    admin?: EffectiveAdmin;
  }
}

export async function requireAdmin(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  try {
    if (!env.adminModuleEnabled) throw new AppError('Admin module is disabled.', 404);
    if (!req.user) throw new AppError('Authentication token is required.', 401);
    req.admin = await resolveAdminPermissions(req.user.id);
    next();
  } catch (error) {
    next(error);
  }
}
