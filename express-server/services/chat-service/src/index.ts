import express from 'express';
import { chatRoutes } from './modules/chat/chat.routes';
import { handleAppError } from '@express-server/shared/src/middlewares/error.middleware';

export const app = express();

app.use(express.json());

app.use('/chat', chatRoutes);

app.use(handleAppError);

export default app;
