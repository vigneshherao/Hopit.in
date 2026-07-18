import type { Request, Response } from 'express';
import * as workerService from '@/services/worker.service.js';
import { AppError } from '@/utils/app-error.js';
import { sendSuccess } from '@/utils/api-response.js';

function requireUser(req: Request) {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  return req.user;
}

export async function listWorkerBookingsController(req: Request, res: Response) {
  const result = await workerService.listWorkerBookings(requireUser(req));
  sendSuccess(res, 200, 'Worker bookings loaded', result);
}

export async function getWorkerBookingController(req: Request, res: Response) {
  const booking = await workerService.getWorkerBooking(String(req.params.id), requireUser(req));
  sendSuccess(res, 200, 'Worker booking loaded', { booking });
}

export async function confirmWorkerBookingController(req: Request, res: Response) {
  const booking = await workerService.confirmWorkerBooking(String(req.params.id), requireUser(req));
  sendSuccess(res, 200, 'Worker booking confirmed', { booking });
}

export async function startWorkerBookingController(req: Request, res: Response) {
  const booking = await workerService.startWorkerBooking(String(req.params.id), requireUser(req));
  sendSuccess(res, 200, 'Worker booking started', { booking });
}

export async function progressWorkerBookingController(req: Request, res: Response) {
  const booking = await workerService.updateWorkerBookingProgress(String(req.params.id), req.body.percentage, requireUser(req));
  sendSuccess(res, 200, 'Worker booking progress updated', { booking });
}

export async function completeWorkerBookingController(req: Request, res: Response) {
  const booking = await workerService.completeWorkerBooking(String(req.params.id), requireUser(req));
  sendSuccess(res, 200, 'Worker booking completed', { booking });
}

export async function cancelWorkerBookingController(req: Request, res: Response) {
  const booking = await workerService.cancelWorkerBooking(String(req.params.id), req.body.reason, requireUser(req));
  sendSuccess(res, 200, 'Worker booking cancelled', { booking });
}

export async function reviewWorkerBookingController(req: Request, res: Response) {
  const review = await workerService.reviewWorkerBooking(String(req.params.id), req.body, requireUser(req));
  sendSuccess(res, 201, 'Worker review submitted', { review });
}
