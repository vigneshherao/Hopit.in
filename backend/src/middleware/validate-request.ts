import type { NextFunction, Request, Response } from 'express';
import type { AnyZodObject, ZodType } from 'zod';
import { AppError } from '@/utils/app-error.js';

interface RequestSchemas {
  body?: AnyZodObject | ZodType;
  params?: AnyZodObject | ZodType;
  query?: AnyZodObject | ZodType;
}

export function validateRequest(schemas: RequestSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const bodyResult = schemas.body?.safeParse(req.body);
    const paramsResult = schemas.params?.safeParse(req.params);
    const queryResult = schemas.query?.safeParse(req.query);

    const failedResult = [bodyResult, paramsResult, queryResult].find((result) => result && !result.success);

    if (failedResult && !failedResult.success) {
      const message = failedResult.error.issues.map((issue) => issue.message).join(', ');
      next(new AppError(message, 400));
      return;
    }

    if (bodyResult?.success) req.body = bodyResult.data;
    if (paramsResult?.success) req.params = paramsResult.data;
    if (queryResult?.success) req.query = queryResult.data;

    next();
  };
}
