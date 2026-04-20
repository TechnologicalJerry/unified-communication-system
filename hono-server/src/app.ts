import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';

import { env } from './config/env.js';
import { handleAppError } from './middlewares/error.middleware.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { userRoutes } from './modules/users/user.routes.js';

export const app = new Hono();

app.use('*', cors());
app.use('*', secureHeaders());

app.get('/health', (c) =>
  c.json({
    status: 'ok',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
);

app.route('/api/v1/auth', authRoutes);
app.route('/api/v1/users', userRoutes);

app.notFound((c) => c.json({ error: { message: 'Route not found' } }, 404));
app.onError(handleAppError);
