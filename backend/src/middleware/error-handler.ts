import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
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
  const normalized = normalizeError(error);
  const statusCode = normalized.statusCode;
  const isOperational = error instanceof AppError ? error.isOperational : false;

  if (!isOperational || statusCode >= 500) {
    logger.error('Unhandled request error', error);
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error' : normalized.message,
    ...(normalized.errors ? { errors: normalized.errors } : {}),
    ...(env.nodeEnv === 'development' && { stack: error.stack }),
  });
}

function normalizeError(error: Error): { statusCode: number; message: string; errors?: AppError['errors'] } {
  if (error instanceof AppError) {
    return { statusCode: error.statusCode, message: error.message, errors: error.errors };
  }

  if (error instanceof mongoose.Error.CastError) {
    return { statusCode: 400, message: 'Invalid identifier.' };
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return {
      statusCode: 400,
      message: 'Validation failed',
      errors: Object.entries(error.errors).map(([field, value]) => ({
        field,
        message: value.message,
      })),
    };
  }

  if (isDuplicateKeyError(error)) {
    return { statusCode: 409, message: 'A record with this value already exists.' };
  }

  if (error instanceof jwt.TokenExpiredError) {
    return { statusCode: 401, message: 'Authentication token has expired.' };
  }

  if (error instanceof jwt.JsonWebTokenError) {
    return { statusCode: 401, message: 'Invalid authentication token.' };
  }

  return { statusCode: 500, message: error.message };
}

function isDuplicateKeyError(error: Error): boolean {
  return 'code' in error && error.code === 11000;
}
