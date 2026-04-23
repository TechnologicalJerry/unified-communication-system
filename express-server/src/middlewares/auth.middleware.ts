import type { NextFunction, Request, Response } from 'express';

import { HttpError } from '../lib/http-error';
import { verifyAccessToken } from '../lib/jwt';

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.header('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new HttpError(401, 'Authorization token is missing or malformed'));
    return;
  }

  const token = authHeader.slice('Bearer '.length).trim();

  if (!token) {
    next(new HttpError(401, 'Authorization token is missing'));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    next(new HttpError(401, 'Invalid or expired authorization token'));
  }
}
