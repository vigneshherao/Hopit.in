import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '@/constants/auth.constants.js';
import { AppError } from '@/utils/app-error.js';
import { verifyAccessToken } from '@/utils/token.js';

function getBearerToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  return header?.startsWith('Bearer ') ? header.slice(7) : undefined;
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = getBearerToken(req);

  if (!token) {
    next(new AppError('Authentication token is required.', 401));
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    next(error);
  }
}

export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = getBearerToken(req);

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
  } catch {
    req.user = undefined;
  }

  next();
}

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Authentication token is required.', 401));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError('You are not authorized to access this resource.', 403));
      return;
    }

    next();
  };
}
