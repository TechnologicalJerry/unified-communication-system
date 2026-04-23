import type { Request, Response } from 'express';

import { HttpError } from '../../lib/http-error';
import { getUserById } from '../users/user.service';
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from './auth.schemas';
import { forgotPassword, login, register, resetPassword } from './auth.service';

export async function registerController(req: Request, res: Response): Promise<void> {
  const payload = registerSchema.parse(req.body);
  const result = await register(payload);

  res.status(201).json({ data: result });
}

export async function loginController(req: Request, res: Response): Promise<void> {
  const payload = loginSchema.parse(req.body);
  const result = await login(payload);

  res.status(200).json({ data: result });
}

export async function forgotPasswordController(req: Request, res: Response): Promise<void> {
  const payload = forgotPasswordSchema.parse(req.body);
  const result = await forgotPassword(payload);

  res.status(200).json({ data: result });
}

export async function resetPasswordController(req: Request, res: Response): Promise<void> {
  const payload = resetPasswordSchema.parse(req.body);
  const result = await resetPassword(payload);

  res.status(200).json({ data: result });
}

export async function meController(req: Request, res: Response): Promise<void> {
  const actor = req.user;

  if (!actor) {
    throw new HttpError(401, 'Authorization token is missing or malformed');
  }

  const user = await getUserById(actor.sub);

  res.status(200).json({ data: user });
}
