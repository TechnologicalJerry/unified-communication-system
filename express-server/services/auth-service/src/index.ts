import express from 'express';
import { authRoutes } from './modules/auth/auth.routes';
import { handleAppError } from '@express-server/shared/src/middlewares/error.middleware';

export const app = express();

app.use(express.json());

app.use('/', authRoutes);

app.use(handleAppError);

export default app;
