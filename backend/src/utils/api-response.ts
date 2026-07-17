import type { Response } from 'express';
import type { ApiResponse } from '@/interfaces/api-response.interface.js';

export function sendSuccess<TData>(
  res: Response,
  statusCode: number,
  message: string,
  data?: TData,
): void {
  const response: ApiResponse<TData> = {
    success: true,
    message,
    ...(data ? { data } : {}),
  };

  res.status(statusCode).json(response);
}
