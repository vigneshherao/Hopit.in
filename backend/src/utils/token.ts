import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env.js';
import type { JwtAccessPayload } from '@/types/http.js';

export function signAccessToken(payload: JwtAccessPayload): string {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn,
    issuer: env.jwtIssuer,
    audience: env.jwtAudience,
    algorithm: 'HS256',
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtAccessPayload {
  return jwt.verify(token, env.jwtAccessSecret, {
    issuer: env.jwtIssuer,
    audience: env.jwtAudience,
    algorithms: ['HS256'],
  }) as JwtAccessPayload;
}

export function createRefreshToken(): string {
  return crypto.randomBytes(64).toString('base64url');
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function getRefreshTokenExpiry(): Date {
  const match = /^(\d+)([smhd])$/.exec(env.jwtRefreshExpiresIn);
  const amount = match ? Number(match[1]) : 7;
  const unit = (match?.[2] ?? 'd') as 's' | 'm' | 'h' | 'd';
  const multiplier = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  }[unit];

  return new Date(Date.now() + amount * multiplier);
}
