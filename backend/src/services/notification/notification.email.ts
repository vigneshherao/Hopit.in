import { logger } from '@/utils/logger.js';

export async function queueNotificationEmail(input: { email?: string; title: string; message: string }): Promise<void> {
  if (!input.email) return;
  logger.info(`Queued notification email: ${input.title}`);
}
