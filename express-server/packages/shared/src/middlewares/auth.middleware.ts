import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyAccessToken } from '../lib/jwt';
import { HttpError } from '../lib/http-error';
import '../types/express.d.ts';

export const authMiddleware: any = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Missing or invalid authorization header'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    next(new HttpError(401, 'Invalid or expired token'));
  }
};
