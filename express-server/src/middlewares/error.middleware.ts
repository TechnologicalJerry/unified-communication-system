import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { logger } from '../config/logger';
import { HttpError } from '../lib/http-error';

export function notFoundMiddleware(_req: Request, res: Response): void {
  res.status(404).json({ error: { message: 'Route not found' } });
}

export function handleAppError(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        details: err.details
      }
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        message: 'Validation failed',
        details: err.flatten()
      }
    });
    return;
  }

  logger.error('Unhandled exception', {
    path: req.path,
    method: req.method,
    error: err instanceof Error ? err.message : String(err)
  });

  res.status(500).json({
    error: {
      message: 'Internal server error'
    }
  });
}
