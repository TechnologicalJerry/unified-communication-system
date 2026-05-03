import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { env } from '@express-server/shared/src/config/env';
import { handleAppError } from '@express-server/shared/src/middlewares/error.middleware';

export const app = express();

app.use(cors());
app.use(helmet());

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

const userServiceUrl = env.USER_SERVICE_URL || 'http://localhost:3004';
const authServiceUrl = env.AUTH_SERVICE_URL || 'http://localhost:3001';
const chatServiceUrl = env.CHAT_SERVICE_URL || 'http://localhost:3002';
const realtimeServiceUrl = env.REALTIME_SERVICE_URL || 'http://localhost:3003';

app.use(
  '/api/v1/users',
  createProxyMiddleware({
    target: userServiceUrl,
    changeOrigin: true,
    pathRewrite: { '^/api/v1/users': '/users' }
  })
);

app.use(
  '/api/v1/auth',
  createProxyMiddleware({
    target: authServiceUrl,
    changeOrigin: true,
    pathRewrite: { '^/api/v1/auth': '/auth' }
  })
);

app.use(
  '/api/v1/chat',
  createProxyMiddleware({
    target: chatServiceUrl,
    changeOrigin: true,
    pathRewrite: { '^/api/v1/chat': '/chat' }
  })
);

app.use(
  '/api/v1/realtime',
  createProxyMiddleware({
    target: realtimeServiceUrl,
    changeOrigin: true,
    ws: true,
    pathRewrite: { '^/api/v1/realtime': '/' }
  })
);

app.use((req, res) => {
  res.status(404).json({ error: { message: 'Route not found' } });
});

app.use(handleAppError);

export default app;
