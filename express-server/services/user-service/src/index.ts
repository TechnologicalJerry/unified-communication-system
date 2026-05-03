import express from 'express';
import { userRoutes } from './modules/users/user.routes';
import { handleAppError } from '@express-server/shared/src/middlewares/error.middleware';

export const app = express();

app.use(express.json());

app.use('/users', userRoutes);

app.use(handleAppError);

export default app;
