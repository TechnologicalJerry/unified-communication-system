import type { Request, Response, NextFunction } from 'express';
import { createUserSchema, objectIdSchema, paginationSchema, updateUserSchema } from './user.schemas';
import { createUserByAdmin, getUserById, getUsers, patchUser, removeUser } from './user.service';
import { HttpError } from '@express-server/shared/src/lib/http-error';

export async function createUserController(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = createUserSchema.parse(req.body);
    const actor = req.user!;
    const user = await createUserByAdmin(payload, actor);
    res.status(201).json({ data: user });
  } catch (error) {
    next(error);
  }
}

export async function listUsersController(req: Request, res: Response, next: NextFunction) {
  try {
    const query = paginationSchema.parse(req.query);
    const result = await getUsers(query.page, query.limit);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getUserByIdController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = objectIdSchema.parse(req.params.id);
    const actor = req.user!;

    if (actor.sub !== userId && actor.role === 'user') {
      throw new HttpError(403, 'Insufficient permissions to view this user');
    }

    const user = await getUserById(userId);
    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
}

export async function updateUserController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = objectIdSchema.parse(req.params.id);
    const payload = updateUserSchema.parse(req.body);
    const actor = req.user!;

    const updated = await patchUser(userId, actor, payload);
    res.status(200).json({ data: updated });
  } catch (error) {
    next(error);
  }
}

export async function deleteUserController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = objectIdSchema.parse(req.params.id);
    const actor = req.user!;

    await removeUser(userId, actor);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
