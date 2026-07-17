import dotenv from 'dotenv';
import { z } from 'zod';
import type { AppEnvironment } from '@/types/environment.js';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5001),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required').default('mongodb://127.0.0.1:27017/hopit'),
  JWT_SECRET: z
    .string()
    .min(16, 'JWT_SECRET must be at least 16 characters')
    .default('development-hopit-secret-change-me'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
  throw new Error(`Invalid environment configuration: ${details}`);
}

export const env: AppEnvironment = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  clientOrigin: parsed.data.CLIENT_ORIGIN,
  mongoUri: parsed.data.MONGODB_URI,
  jwtSecret: parsed.data.JWT_SECRET,
  jwtExpiresIn: parsed.data.JWT_EXPIRES_IN,
  cloudinaryCloudName: parsed.data.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: parsed.data.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: parsed.data.CLOUDINARY_API_SECRET,
};
