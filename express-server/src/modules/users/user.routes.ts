import { Router } from 'express';

import { asyncHandler } from '../../lib/async-handler';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/role.middleware';
import {
  createUserController,
  deleteUserController,
  getUserByIdController,
  listUsersController,
  updateUserController
} from './user.controller';

export const userRoutes = Router();

userRoutes.use(authMiddleware);

userRoutes.post('/', requireRoles(['admin', 'manager']), asyncHandler(createUserController));
userRoutes.get('/', requireRoles(['admin', 'manager', 'supperwizer', 'lead']), asyncHandler(listUsersController));
userRoutes.get('/:id', asyncHandler(getUserByIdController));
userRoutes.patch('/:id', asyncHandler(updateUserController));
userRoutes.delete('/:id', asyncHandler(deleteUserController));
