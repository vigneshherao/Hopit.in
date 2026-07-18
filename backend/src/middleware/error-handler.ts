import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import type { NextFunction, Request, Response } from 'express';
import { AppError } from '@/utils/app-error.js';
import { logger } from '@/utils/logger.js';

export function errorHandler(
  error: Error,
  req: Request,
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
    error: {
      code: normalized.code,
      message: statusCode === 500 ? 'Internal server error' : normalized.message,
      ...(normalized.errors ? { fields: Object.fromEntries(normalized.errors.map(({ field, message }) => [field, message])) } : {}),
    },
    requestId: req.requestId,
  });
}

function normalizeError(error: Error): { statusCode: number; code: string; message: string; errors?: AppError['errors'] } {
  if (error instanceof AppError) {
    return { statusCode: error.statusCode, code: statusCodeToCode(error.statusCode), message: error.message, errors: error.errors };
  }

  if (error instanceof mongoose.Error.CastError) {
    return { statusCode: 400, code: 'VALIDATION_ERROR', message: 'Invalid identifier.' };
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return {
      statusCode: 400,
      code: 'VALIDATION_ERROR', message: 'Validation failed',
      errors: Object.entries(error.errors).map(([field, value]) => ({
        field,
        message: value.message,
      })),
    };
  }

  if (isDuplicateKeyError(error)) {
    return { statusCode: 409, code: 'CONFLICT', message: 'A record with this value already exists.' };
  }

  if (error instanceof jwt.TokenExpiredError) {
    return { statusCode: 401, code: 'AUTHENTICATION_ERROR', message: 'Authentication token has expired.' };
  }

  if (error instanceof jwt.JsonWebTokenError) {
    return { statusCode: 401, code: 'AUTHENTICATION_ERROR', message: 'Invalid authentication token.' };
  }

  return { statusCode: 500, code: 'INTERNAL_ERROR', message: 'Internal server error' };
}

function statusCodeToCode(statusCode: number): string {
  if (statusCode === 400 || statusCode === 422) return 'VALIDATION_ERROR';
  if (statusCode === 401) return 'AUTHENTICATION_ERROR';
  if (statusCode === 403) return 'AUTHORIZATION_ERROR';
  if (statusCode === 404) return 'NOT_FOUND';
  if (statusCode === 409) return 'CONFLICT';
  if (statusCode === 415) return 'UNSUPPORTED_MEDIA_TYPE';
  if (statusCode === 429) return 'RATE_LIMITED';
  return statusCode >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR';
}

function isDuplicateKeyError(error: Error): boolean {
  return 'code' in error && error.code === 11000;
}
