import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '@express-server/shared/src/middlewares/auth.middleware';
import { redis } from '@express-server/redis';

export const chatRoutes = Router();

chatRoutes.use(authMiddleware);

chatRoutes.get('/channels', (req: Request, res: Response) => {
  res.json({ channels: [] });
});

chatRoutes.post('/channels', (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const channel = { id: Date.now().toString(), name: 'New Channel' };
    
    await redis.publish('chat:events', JSON.stringify({
      type: 'CHANNEL_CREATED',
      payload: channel
    }));

    res.status(201).json({ message: 'Channel created', channel });
  } catch (error) {
    next(error);
  }
}) as any);
