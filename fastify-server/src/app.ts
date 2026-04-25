import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import fastify from 'fastify';

import { env } from './config/env';
import { errorHandler } from './middlewares/error.middleware';
import { authRoutes } from './modules/auth/auth.routes';
import { userRoutes } from './modules/users/user.routes';

export const app = fastify({
  logger: env.NODE_ENV === 'production'
});

// Register plugins
app.register(helmet);
app.register(cors);

// Error handler
app.setErrorHandler(errorHandler);

// Health check endpoint
app.get('/health', async () => ({
  status: 'ok',
  environment: env.NODE_ENV,
  timestamp: new Date().toISOString()
}));

// Register routes
app.register(authRoutes, { prefix: '/api/v1/auth' });
app.register(userRoutes, { prefix: '/api/v1/users' });

// 404 handler
app.setNotFoundHandler(async (req, reply) => {
  reply.status(404).send({ error: { message: 'Route not found' } });
});
