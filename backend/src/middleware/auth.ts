import type { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env.js';
import type { AuthenticatedRequest } from '@/types/http.js';
import { AppError } from '@/utils/app-error.js';

interface JwtPayload {
  sub: string;
  role: string;
}

export function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (!token) {
    next(new AppError('Authentication token is required.', 401));
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    req.user = {
      id: decoded.sub,
      role: decoded.role,
    };
    next();
  } catch {
    next(new AppError('Invalid or expired authentication token.', 401));
  }
}
