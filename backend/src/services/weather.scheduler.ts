import { logger } from '@/utils/logger.js';

const jobs: NodeJS.Timeout[] = [];

export function startWeatherScheduler(callbacks: { refreshWeather: () => Promise<void>; refreshPredictions: () => Promise<void>; refreshInsights: () => Promise<void> }) {
  if (jobs.length) return;
  jobs.push(setInterval(() => callbacks.refreshWeather().catch((error) => logger.error('Weather refresh job failed', error)), 6 * 60 * 60 * 1000));
  jobs.push(setInterval(() => callbacks.refreshPredictions().catch((error) => logger.error('Weather prediction job failed', error)), 12 * 60 * 60 * 1000));
  jobs.push(setInterval(() => callbacks.refreshInsights().catch((error) => logger.error('Weather insight job failed', error)), 24 * 60 * 60 * 1000));
}

export function stopWeatherScheduler() {
  while (jobs.length) {
    const job = jobs.pop();
    if (job) clearInterval(job);
  }
}

