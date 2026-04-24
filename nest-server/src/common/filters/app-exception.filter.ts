import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ZodError } from 'zod';

import { logger } from '../../config/logger';
import { HttpError } from '../../lib/http-error';

type ErrorResponse = {
  error: {
    message: string;
    details?: unknown;
  };
};

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<{ status(code: number): { json(payload: ErrorResponse): void } }>();
    const request = ctx.getRequest<{ path: string; method: string }>();

    if (exception instanceof HttpError) {
      response.status(exception.statusCode).json({
        error: {
          message: exception.message,
          details: exception.details,
        },
      });
      return;
    }

    if (exception instanceof ZodError) {
      response.status(HttpStatus.BAD_REQUEST).json({
        error: {
          message: 'Validation failed',
          details: exception.flatten(),
        },
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const raw = exception.getResponse();
      const message =
        typeof raw === 'string'
          ? raw
          : typeof raw === 'object' && raw !== null && 'message' in raw
            ? String((raw as { message: unknown }).message)
            : exception.message;

      response.status(status).json({
        error: {
          message,
          details: typeof raw === 'object' ? raw : undefined,
        },
      });
      return;
    }

    logger.error('Unhandled exception', {
      path: request.path,
      method: request.method,
      error: exception instanceof Error ? exception.message : String(exception),
    });

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: {
        message: 'Internal server error',
      },
    });
  }
}
