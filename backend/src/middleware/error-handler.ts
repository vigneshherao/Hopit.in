import type { NextFunction, Request, Response } from 'express';
import { env } from '@/config/env.js';
import { AppError } from '@/utils/app-error.js';
import { logger } from '@/utils/logger.js';

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const isOperational = error instanceof AppError ? error.isOperational : false;

  if (!isOperational || statusCode >= 500) {
    logger.error('Unhandled request error', error);
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error' : error.message,
    ...(env.nodeEnv === 'development' && { stack: error.stack }),
  });
}
