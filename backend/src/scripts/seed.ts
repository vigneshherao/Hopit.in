import { connectDatabase, disconnectDatabase } from '@/config/database.js';
import { env } from '@/config/env.js';
import { UserModel } from '@/models/user.model.js';
import { WorkerProfileModel } from '@/models/worker-profile.model.js';
import { logger } from '@/utils/logger.js';

const demoPassword = 'AgriLink@123';
const allowProductionSeed = process.env.ALLOW_PRODUCTION_SEED === 'true';

const demoUsers = [
  { name: 'Demo Owner', email: 'owner@agrilink.demo', role: 'owner' },
  { name: 'Demo Farmer', email: 'farmer@agrilink.demo', role: 'farmer' },
  { name: 'Demo Worker', email: 'worker@agrilink.demo', role: 'worker' },
  { name: 'Demo Admin', email: 'admin@agrilink.demo', role: 'admin' },
] as const;

async function seed(): Promise<void> {
  if (env.nodeEnv === 'production' && !allowProductionSeed) {
    throw new Error('Seed blocked in production. Set ALLOW_PRODUCTION_SEED=true to override explicitly.');
  }

  await connectDatabase();

  for (const demoUser of demoUsers) {
    const existing = await UserModel.findOne({ email: demoUser.email }).select('+password');

    const user =
      existing ??
      new UserModel({
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.role,
        password: demoPassword,
        isEmailVerified: true,
        isPhoneVerified: false,
        isActive: true,
      });

    user.name = demoUser.name;
    user.role = demoUser.role;
    user.password = demoPassword;
    user.isActive = true;
    user.isEmailVerified = true;
    await user.save();

    if (demoUser.role === 'worker') {
      await WorkerProfileModel.updateOne(
        { userId: user._id },
        {
          $setOnInsert: {
            userId: user._id,
            skills: ['sowing', 'harvesting'],
            experienceYears: 3,
            dailyWage: 750,
            availabilityStatus: 'available',
            serviceRadiusKm: 25,
          },
        },
        { upsert: true },
      );
    }
  }

  logger.info('Development demo users seeded. Password: AgriLink@123');
}

seed()
  .catch((error: unknown) => {
    logger.error('Seed failed', error instanceof Error ? error : String(error));
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
