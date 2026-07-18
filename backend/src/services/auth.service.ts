import type { Request, Response } from 'express';
import { env } from '@/config/env.js';
import { REFRESH_TOKEN_COOKIE_NAME } from '@/constants/auth.constants.js';
import { LoginHistoryModel } from '@/models/login-history.model.js';
import { RefreshTokenModel } from '@/models/refresh-token.model.js';
import { UserModel, type UserDocument } from '@/models/user.model.js';
import { WorkerProfileModel } from '@/models/worker-profile.model.js';
import type {
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
} from '@/validators/auth.validator.js';
import { AppError } from '@/utils/app-error.js';
import {
  createRefreshToken,
  getRefreshTokenExpiry,
  hashRefreshToken,
  signAccessToken,
} from '@/utils/token.js';
import type { AuthResponse, SafeUser } from '@/types/http.js';

const cookiePath = '/api/v1/auth';

export function setRefreshCookie(res: Response, refreshToken: string): void {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: env.nodeEnv === 'production' || env.cookieSecure,
    sameSite: env.cookieSameSite,
    path: cookiePath,
    maxAge: getRefreshTokenExpiry().getTime() - Date.now(),
  });
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: env.nodeEnv === 'production' || env.cookieSecure,
    sameSite: env.cookieSameSite,
    path: cookiePath,
  });
}

export function readRefreshToken(req: Request): string | undefined {
  const cookieToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] as string | undefined;
  const bodyToken = typeof req.body?.refreshToken === 'string' ? req.body.refreshToken : undefined;
  return cookieToken ?? (env.nodeEnv === 'development' || env.nodeEnv === 'test' ? bodyToken : undefined);
}

export async function registerUser(input: RegisterInput, req: Request): Promise<AuthResponse & { refreshToken: string }> {
  const existing = await UserModel.exists({ email: input.email });
  if (existing) {
    throw new AppError('Email is already registered.', 409, true, [
      { field: 'email', message: 'Email is already registered.' },
    ]);
  }

  const user = await UserModel.create({
    name: input.name,
    email: input.email,
    phone: input.phone || undefined,
    password: input.password,
    role: input.role,
  });

  if (input.role === 'worker') {
    await WorkerProfileModel.create({ userId: user._id });
  }

  return issueAuthResponse(user, req);
}

export async function loginUser(input: LoginInput, req: Request): Promise<AuthResponse & { refreshToken: string }> {
  const user = await UserModel.findOne({ email: input.email }).select('+password');

  if (!user || !(await user.comparePassword(input.password))) {
    await recordLoginAttempt(req, { email: input.email, success: false, failureReasonCategory: 'invalid-credentials' });
    throw new AppError('Invalid email or password.', 401);
  }

  if (!user.isActive) {
    await recordLoginAttempt(req, { userId: user._id, email: user.email, success: false, failureReasonCategory: 'inactive-account' });
    throw new AppError('Invalid email or password.', 401);
  }

  user.lastLoginAt = new Date();
  await user.save();
  await recordLoginAttempt(req, { userId: user._id, email: user.email, success: true });

  return issueAuthResponse(user, req);
}

export async function refreshSession(req: Request): Promise<AuthResponse & { refreshToken: string }> {
  const incomingToken = readRefreshToken(req);
  if (!incomingToken) {
    throw new AppError('Refresh token is required.', 401);
  }

  const tokenHash = hashRefreshToken(incomingToken);
  const storedToken = await RefreshTokenModel.findOne({
    tokenHash,
    revokedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  });

  if (!storedToken) {
    throw new AppError('Invalid refresh token.', 401);
  }

  const user = await UserModel.findById(storedToken.userId);
  if (!user || !user.isActive) {
    throw new AppError('Invalid refresh token.', 401);
  }

  storedToken.revokedAt = new Date();
  await storedToken.save();

  return issueAuthResponse(user, req);
}

export async function logoutUser(req: Request): Promise<void> {
  const token = readRefreshToken(req);
  if (!token) return;

  await RefreshTokenModel.updateOne(
    { tokenHash: hashRefreshToken(token), revokedAt: { $exists: false } },
    { $set: { revokedAt: new Date() } },
  );
}

export async function logoutAll(userId: string): Promise<void> {
  await RefreshTokenModel.updateMany(
    { userId, revokedAt: { $exists: false } },
    { $set: { revokedAt: new Date() } },
  );
}

export async function getCurrentUser(userId: string): Promise<SafeUser> {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return user.toSafeUser();
}

export async function updateCurrentUser(userId: string, input: UpdateProfileInput): Promise<SafeUser> {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (input.name !== undefined) user.name = input.name;
  if (input.phone !== undefined) user.phone = input.phone || undefined;
  if (input.avatar !== undefined) user.avatar = input.avatar || undefined;
  if (input.location !== undefined) user.location = input.location;

  await user.save();
  return user.toSafeUser();
}

export async function changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
  const user = await UserModel.findById(userId).select('+password');
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const currentMatches = await user.comparePassword(input.currentPassword);
  if (!currentMatches) {
    throw new AppError('Current password is incorrect.', 400);
  }

  const reused = await user.comparePassword(input.newPassword);
  if (reused) {
    throw new AppError('New password must be different from the current password.', 400);
  }

  user.password = input.newPassword;
  await user.save();
  await logoutAll(userId);
}

async function issueAuthResponse(
  user: UserDocument,
  req: Request,
): Promise<AuthResponse & { refreshToken: string }> {
  const safeUser = user.toSafeUser();
  const accessToken = signAccessToken({
    sub: safeUser.id,
    email: safeUser.email,
    role: safeUser.role,
  });
  const refreshToken = createRefreshToken();

  await RefreshTokenModel.create({
    userId: user._id,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt: getRefreshTokenExpiry(),
    createdByIp: req.ip,
    userAgent: req.get('user-agent'),
  });

  return {
    user: safeUser,
    accessToken,
    refreshToken,
  };
}

async function recordLoginAttempt(
  req: Request,
  input: { userId?: unknown; email?: string; success: boolean; failureReasonCategory?: string },
) {
  try {
    const userAgent = req.get('user-agent') ?? '';
    await LoginHistoryModel.create({
      userId: input.userId,
      email: input.email,
      success: input.success,
      failureReasonCategory: input.failureReasonCategory,
      device: userAgent.slice(0, 240),
      ip: req.ip,
      riskFlags: [],
    });
  } catch {
    // Login audit logging should never block authentication.
  }
}
