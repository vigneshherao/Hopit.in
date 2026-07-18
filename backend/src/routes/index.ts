import { Router } from 'express';
import { agreementRouter } from '@/routes/agreement.routes.js';
import { aiRouter } from '@/routes/ai.routes.js';
import { applicationRouter } from '@/routes/application.routes.js';
import { authRouter } from '@/routes/auth.routes.js';
import { farmJobRouter } from '@/routes/farm-job.routes.js';
import { farmManagementRouter } from '@/routes/farm-management.routes.js';
import { farmPlannerRouter } from '@/routes/farm-planner.routes.js';
import { healthRouter } from '@/routes/health.routes.js';
import { landRouter } from '@/routes/land.routes.js';
import { workerBookingRouter } from '@/routes/worker-booking.routes.js';
import { workerRouter } from '@/routes/worker.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/applications', applicationRouter);
apiRouter.use('/agreements', agreementRouter);
apiRouter.use('/ai', aiRouter);
apiRouter.use('/farm-jobs', farmJobRouter);
apiRouter.use('/farm-management', farmManagementRouter);
apiRouter.use('/farm-planner', farmPlannerRouter);
apiRouter.use('/health', healthRouter);
apiRouter.use('/lands', landRouter);
apiRouter.use('/worker-bookings', workerBookingRouter);
apiRouter.use('/workers', workerRouter);
