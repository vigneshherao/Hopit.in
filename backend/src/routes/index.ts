import { Router } from 'express';
import { agreementRouter } from '@/routes/agreement.routes.js';
import { applicationRouter } from '@/routes/application.routes.js';
import { authRouter } from '@/routes/auth.routes.js';
import { healthRouter } from '@/routes/health.routes.js';
import { landRouter } from '@/routes/land.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/applications', applicationRouter);
apiRouter.use('/agreements', agreementRouter);
apiRouter.use('/health', healthRouter);
apiRouter.use('/lands', landRouter);
