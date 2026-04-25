import type { FastifyInstance } from 'fastify';

import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRoles } from '../../middlewares/role.middleware';
import {
  createUserController,
  deleteUserController,
  getUserByIdController,
  listUsersController,
  updateUserController
} from './user.controller';

export async function userRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', authMiddleware);

  fastify.post('/', { onRequest: requireRoles(['admin', 'manager']) }, async (req, reply) =>
    createUserController(req, reply)
  );

  fastify.get('/', { onRequest: requireRoles(['admin', 'manager', 'supperwizer', 'lead']) }, async (req, reply) =>
    listUsersController(req, reply)
  );

  fastify.get('/:id', async (req, reply) => getUserByIdController(req, reply));

  fastify.patch('/:id', async (req, reply) => updateUserController(req, reply));

  fastify.delete('/:id', async (req, reply) => deleteUserController(req, reply));
}
