import { Router } from 'express';

import { asyncHandler } from '../../lib/async-handler';
import { authMiddleware } from '../../middlewares/auth.middleware';
import {
  forgotPasswordController,
  loginController,
  meController,
  registerController,
  resetPasswordController
} from './auth.controller';

export const authRoutes = Router();

authRoutes.post('/register', asyncHandler(registerController));
authRoutes.post('/login', asyncHandler(loginController));
authRoutes.post('/forgot-password', asyncHandler(forgotPasswordController));
authRoutes.post('/reset-password', asyncHandler(resetPasswordController));
authRoutes.get('/me', authMiddleware, asyncHandler(meController));
