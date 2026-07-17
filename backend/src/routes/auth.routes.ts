import { Router } from 'express';
import {
  changePasswordController,
  loginController,
  logoutAllController,
  logoutController,
  meController,
  refreshController,
  registerController,
  updateMeController,
} from '@/controllers/auth.controller.js';
import { authenticate, authorize } from '@/middleware/auth.js';
import { authRateLimit } from '@/middleware/auth-rate-limit.js';
import { validateRequest } from '@/middleware/validate-request.js';
import { asyncHandler } from '@/utils/async-handler.js';
import {
  changePasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  updateProfileSchema,
} from '@/validators/auth.validator.js';

export const authRouter = Router();

authRouter.post(
  '/register',
  authRateLimit,
  validateRequest({ body: registerSchema }),
  asyncHandler(registerController),
);
authRouter.post('/login', authRateLimit, validateRequest({ body: loginSchema }), asyncHandler(loginController));
authRouter.post(
  '/refresh',
  authRateLimit,
  validateRequest({ body: refreshSchema.partial().optional() }),
  asyncHandler(refreshController),
);
authRouter.post('/logout', asyncHandler(logoutController));
authRouter.post('/logout-all', authenticate, asyncHandler(logoutAllController));
authRouter.get('/me', authenticate, asyncHandler(meController));
authRouter.patch('/me', authenticate, validateRequest({ body: updateProfileSchema }), asyncHandler(updateMeController));
authRouter.patch(
  '/change-password',
  authRateLimit,
  authenticate,
  validateRequest({ body: changePasswordSchema }),
  asyncHandler(changePasswordController),
);
authRouter.get('/owner-check', authenticate, authorize('owner', 'admin'), (_req, res) => {
  res.status(200).json({ success: true, message: 'Authorized' });
});
