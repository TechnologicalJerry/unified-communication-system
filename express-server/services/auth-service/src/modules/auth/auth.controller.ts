import type { Request, Response, NextFunction } from 'express';

import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from './auth.schemas';
import { forgotPassword, login, register, resetPassword, getMe } from './auth.service';

export async function registerController(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = registerSchema.parse(req.body);
    const result = await register(payload);
    res.status(201).json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function loginController(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = loginSchema.parse(req.body);
    const result = await login(payload);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function forgotPasswordController(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = forgotPasswordSchema.parse(req.body);
    const result = await forgotPassword(payload);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function resetPasswordController(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = resetPasswordSchema.parse(req.body);
    const result = await resetPassword(payload);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function meController(req: Request, res: Response, next: NextFunction) {
  try {
    const actor = req.user!;
    const user = await getMe(actor.sub);
    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
}
