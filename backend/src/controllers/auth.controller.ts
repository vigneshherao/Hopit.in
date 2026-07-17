import type { Request, Response } from 'express';
import {
  changePassword,
  clearRefreshCookie,
  getCurrentUser,
  loginUser,
  logoutAll,
  logoutUser,
  refreshSession,
  registerUser,
  setRefreshCookie,
  updateCurrentUser,
} from '@/services/auth.service.js';
import { AppError } from '@/utils/app-error.js';
import { sendSuccess } from '@/utils/api-response.js';

export async function registerController(req: Request, res: Response): Promise<void> {
  const result = await registerUser(req.body, req);
  setRefreshCookie(res, result.refreshToken);
  sendSuccess(res, 201, 'Registration successful', {
    user: result.user,
    accessToken: result.accessToken,
  });
}

export async function loginController(req: Request, res: Response): Promise<void> {
  const result = await loginUser(req.body, req);
  setRefreshCookie(res, result.refreshToken);
  sendSuccess(res, 200, 'Login successful', {
    user: result.user,
    accessToken: result.accessToken,
  });
}

export async function refreshController(req: Request, res: Response): Promise<void> {
  const result = await refreshSession(req);
  setRefreshCookie(res, result.refreshToken);
  sendSuccess(res, 200, 'Session refreshed', {
    user: result.user,
    accessToken: result.accessToken,
  });
}

export async function logoutController(req: Request, res: Response): Promise<void> {
  await logoutUser(req);
  clearRefreshCookie(res);
  sendSuccess(res, 200, 'Logout successful');
}

export async function logoutAllController(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  await logoutAll(req.user.id);
  clearRefreshCookie(res);
  sendSuccess(res, 200, 'Logged out from all sessions');
}

export async function meController(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  const user = await getCurrentUser(req.user.id);
  sendSuccess(res, 200, 'Current user loaded', { user });
}

export async function updateMeController(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  const user = await updateCurrentUser(req.user.id, req.body);
  sendSuccess(res, 200, 'Profile updated', { user });
}

export async function changePasswordController(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  await changePassword(req.user.id, req.body);
  clearRefreshCookie(res);
  sendSuccess(res, 200, 'Password changed. Please login again.');
}
