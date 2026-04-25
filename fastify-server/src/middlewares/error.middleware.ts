import type { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

import { logger } from '../config/logger';
import { HttpError } from '../lib/http-error';

export async function errorHandler(error: unknown, req: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (error instanceof HttpError) {
    reply.status(error.statusCode).send({
      error: {
        message: error.message,
        details: error.details
      }
    });
    return;
  }

  if (error instanceof ZodError) {
    reply.status(400).send({
      error: {
        message: 'Validation failed',
        details: error.flatten()
      }
    });
    return;
  }

  logger.error('Unhandled exception', {
    path: req.url,
    method: req.method,
    error: error instanceof Error ? error.message : String(error)
  });

  reply.status(500).send({
    error: {
      message: 'Internal server error'
    }
  });
}
