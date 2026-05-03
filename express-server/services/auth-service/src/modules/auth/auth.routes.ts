import { Router } from 'express';
import { authMiddleware } from '@express-server/shared/src/middlewares/auth.middleware';
import {
  forgotPasswordController,
  loginController,
  meController,
  registerController,
  resetPasswordController
} from './auth.controller';

export const authRoutes = Router();

authRoutes.post('/register', registerController as any);
authRoutes.post('/login', loginController as any);
authRoutes.post('/forgot-password', forgotPasswordController as any);
authRoutes.post('/reset-password', resetPasswordController as any);
authRoutes.get('/me', authMiddleware, meController as any);
