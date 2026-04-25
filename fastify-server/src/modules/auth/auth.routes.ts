import type { FastifyInstance } from 'fastify';

import { authMiddleware } from '../../middlewares/auth.middleware';
import {
  forgotPasswordController,
  loginController,
  meController,
  registerController,
  resetPasswordController
} from './auth.controller';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', async (req, reply) => registerController(req, reply));
  fastify.post('/login', async (req, reply) => loginController(req, reply));
  fastify.post('/forgot-password', async (req, reply) => forgotPasswordController(req, reply));
  fastify.post('/reset-password', async (req, reply) => resetPasswordController(req, reply));
  fastify.get('/me', { onRequest: authMiddleware }, async (req, reply) => meController(req, reply));
}
