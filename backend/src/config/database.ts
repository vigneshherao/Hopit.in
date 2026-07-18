import mongoose from 'mongoose';
import { env } from '@/config/env.js';
import { logger } from '@/utils/logger.js';

export async function connectDatabase(): Promise<void> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });
  await dropLegacyIndexes();
  logger.info('MongoDB connected');
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.connection.close();
  logger.info('MongoDB disconnected');
}

async function dropLegacyIndexes(): Promise<void> {
  try {
    await mongoose.connection.collection('farmjobs').dropIndex('professionalRolesRequired_1_skillsRequired_1_workType_1');
    logger.info('Dropped legacy farm job parallel-array index');
  } catch (error) {
    const codeName = (error as { codeName?: string }).codeName;
    const code = (error as { code?: number }).code;
    if (codeName === 'IndexNotFound' || code === 27 || codeName === 'NamespaceNotFound' || code === 26) return;
    logger.warn('Unable to drop legacy farm job index', error instanceof Error ? error : { error });
  }
}
