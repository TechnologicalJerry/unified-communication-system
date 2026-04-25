import type { FastifyReply, FastifyRequest } from 'fastify';

import { HttpError } from '../../lib/http-error';
import { getUserById } from '../users/user.service';
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from './auth.schemas';
import { forgotPassword, login, register, resetPassword } from './auth.service';

export async function registerController(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const payload = registerSchema.parse(req.body);
  const result = await register(payload);

  reply.status(201).send({ data: result });
}

export async function loginController(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const payload = loginSchema.parse(req.body);
  const result = await login(payload);

  reply.status(200).send({ data: result });
}

export async function forgotPasswordController(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const payload = forgotPasswordSchema.parse(req.body);
  const result = await forgotPassword(payload);

  reply.status(200).send({ data: result });
}

export async function resetPasswordController(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const payload = resetPasswordSchema.parse(req.body);
  const result = await resetPassword(payload);

  reply.status(200).send({ data: result });
}

export async function meController(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const actor = req.user;

  if (!actor) {
    throw new HttpError(401, 'Authorization token is missing or malformed');
  }

  const user = await getUserById(actor.sub);

  reply.status(200).send({ data: user });
}
