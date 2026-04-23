import type { Request, Response } from 'express';

import { HttpError } from '../../lib/http-error';
import type { AuthUser } from '../../types/express';
import { createUserSchema, objectIdSchema, paginationSchema, updateUserSchema } from './user.schemas';
import { createUserByAdmin, getUserById, getUsers, patchUser, removeUser } from './user.service';

export async function createUserController(req: Request, res: Response): Promise<void> {
  const payload = createUserSchema.parse(req.body);
  const actor = req.user as AuthUser;
  const user = await createUserByAdmin(payload, actor);

  res.status(201).json({ data: user });
}

export async function listUsersController(req: Request, res: Response): Promise<void> {
  const query = paginationSchema.parse(req.query);
  const result = await getUsers(query.page, query.limit);

  res.status(200).json(result);
}

export async function getUserByIdController(req: Request, res: Response): Promise<void> {
  const userId = objectIdSchema.parse(req.params.id);
  const actor = req.user as AuthUser;

  if (actor.sub !== userId && actor.role === 'user') {
    res.status(403).json({ error: { message: 'Insufficient permissions to view this user' } });
    return;
  }

  const user = await getUserById(userId);

  res.status(200).json({ data: user });
}

export async function updateUserController(req: Request, res: Response): Promise<void> {
  const userId = objectIdSchema.parse(req.params.id);
  const payload = updateUserSchema.parse(req.body);
  const actor = req.user as AuthUser;

  const updated = await patchUser(userId, actor, payload);
  res.status(200).json({ data: updated });
}

export async function deleteUserController(req: Request, res: Response): Promise<void> {
  const userId = objectIdSchema.parse(req.params.id);
  const actor = req.user;

  if (!actor) {
    throw new HttpError(401, 'Authorization token is missing or malformed');
  }

  await removeUser(userId, actor);
  res.status(204).send();
}
