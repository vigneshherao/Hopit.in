import type { Server } from 'node:http';
import { createApp } from '@/app.js';
import { connectDatabase, disconnectDatabase } from '@/config/database.js';
import { env } from '@/config/env.js';
import { logger } from '@/utils/logger.js';

let server: Server | undefined;

async function bootstrap(): Promise<void> {
  try {
    await connectDatabase();
  } catch (error) {
    if (env.nodeEnv === 'production') {
      throw error;
    }

    logger.warn(
      'MongoDB connection unavailable; API started in development mode without database access',
      error instanceof Error ? error : String(error),
    );
  }

  const app = createApp();
  server = app.listen(env.port, () => {
    logger.info(`Hopt It API listening on port ${env.port}`);
  });
}

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  logger.info(`Received ${signal}. Starting graceful shutdown.`);

  if (server) {
    await new Promise<void>((resolve, reject) => {
      server?.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  await disconnectDatabase();
  process.exit(0);
}

process.on('SIGINT', (signal) => {
  void shutdown(signal);
});

process.on('SIGTERM', (signal) => {
  void shutdown(signal);
});

bootstrap().catch((error: unknown) => {
  logger.error('Failed to start Hopt It API', error instanceof Error ? error : String(error));
  process.exit(1);
});
