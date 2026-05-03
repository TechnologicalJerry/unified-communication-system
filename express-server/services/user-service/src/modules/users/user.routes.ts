import { Router } from 'express';
import { authMiddleware } from '@express-server/shared/src/middlewares/auth.middleware';
import { requireRoles } from '@express-server/shared/src/middlewares/role.middleware';
import {
  createUserController,
  deleteUserController,
  getUserByIdController,
  listUsersController,
  updateUserController
} from './user.controller';

export const userRoutes = Router();

userRoutes.use(authMiddleware);

userRoutes.post('/', requireRoles(['admin', 'manager']), createUserController as any);
userRoutes.get('/', requireRoles(['admin', 'manager', 'supperwizer', 'lead']), listUsersController as any);
userRoutes.get('/:id', getUserByIdController as any);
userRoutes.patch('/:id', updateUserController as any);
userRoutes.delete('/:id', deleteUserController as any);
