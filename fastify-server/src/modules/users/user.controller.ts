import type { FastifyReply, FastifyRequest } from 'fastify';

import { HttpError } from '../../lib/http-error';
import type { AuthUser } from '../../types/fastify';
import { createUserSchema, objectIdSchema, paginationSchema, updateUserSchema } from './user.schemas';
import { createUserByAdmin, getUserById, getUsers, patchUser, removeUser } from './user.service';

export async function createUserController(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const payload = createUserSchema.parse(req.body);
  const actor = req.user as AuthUser;
  const user = await createUserByAdmin(payload, actor);

  reply.status(201).send({ data: user });
}

export async function listUsersController(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const query = paginationSchema.parse(req.query);
  const result = await getUsers(query.page, query.limit);

  reply.status(200).send(result);
}

export async function getUserByIdController(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const userId = objectIdSchema.parse((req.params as Record<string, unknown>).id);
  const actor = req.user as AuthUser;

  if (actor.sub !== userId && actor.role === 'user') {
    reply.status(403).send({ error: { message: 'Insufficient permissions to view this user' } });
    return;
  }

  const user = await getUserById(userId);

  reply.status(200).send({ data: user });
}

export async function updateUserController(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const userId = objectIdSchema.parse((req.params as Record<string, unknown>).id);
  const payload = updateUserSchema.parse(req.body);
  const actor = req.user as AuthUser;

  const updated = await patchUser(userId, actor, payload);
  reply.status(200).send({ data: updated });
}

export async function deleteUserController(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const userId = objectIdSchema.parse((req.params as Record<string, unknown>).id);
  const actor = req.user;

  if (!actor) {
    throw new HttpError(401, 'Authorization token is missing or malformed');
  }

  await removeUser(userId, actor);
  reply.status(204).send();
}
