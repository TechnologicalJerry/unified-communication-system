import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { env } from './config/env';
import { handleAppError, notFoundMiddleware } from './middlewares/error.middleware';
import { authRoutes } from './modules/auth/auth.routes';
import { userRoutes } from './modules/users/user.routes';

export const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get('/health', (_req, res) =>
  res.json({
    status: 'ok',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

app.use(notFoundMiddleware);
app.use(handleAppError);
