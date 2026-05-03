import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../lib/http-error';
import { logger } from '../config/logger';
import { env } from '../config/env';

export const handleAppError: any = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message
      }
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        message: 'Validation failed',
        details: err.errors
      }
    });
    return;
  }

  logger.error('Unhandled application error', {
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  res.status(500).json({
    error: {
      message: env.NODE_ENV === 'production' ? 'Internal server error' : (err.message || 'Internal server error')
    }
  });
};
