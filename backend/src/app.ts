import compression from 'compression';
import crypto from 'node:crypto';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { env } from '@/config/env.js';
import { errorHandler } from '@/middleware/error-handler.js';
import { notFound } from '@/middleware/not-found.js';
import { logger } from '@/utils/logger.js';
import { apiRouter } from '@/routes/index.js';
import { healthController, readinessController } from '@/controllers/health.controller.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    const incoming = req.get('x-request-id');
    const requestId = incoming && /^[A-Za-z0-9._-]{8,100}$/.test(incoming) ? incoming : crypto.randomUUID();
    const startedAt = process.hrtime.bigint();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);
    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
      logger.info('request.completed', {
        requestId,
        method: req.method,
        route: req.originalUrl.split('?')[0],
        status: res.statusCode,
        durationMs: Math.round(durationMs * 100) / 100,
        ...(req.user?.id ? { userId: req.user.id } : {}),
      });
    });
    next();
  });
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        connectSrc: ["'self'", ...env.allowedOrigins, 'https:', 'wss:'],
      },
    },
  }));
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || env.allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error('Origin is not allowed by CORS.'));
      },
      credentials: true,
    }),
  );
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
    }),
  );
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));
  app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

  app.get('/health', healthController);
  app.get('/ready', readinessController);
  app.use('/api/v1', apiRouter);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
