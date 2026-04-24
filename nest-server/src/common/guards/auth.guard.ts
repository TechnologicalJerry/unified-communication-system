import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { HttpError } from '../../lib/http-error';
import { verifyAccessToken } from '../../lib/jwt';

type RequestWithUser = {
  headers: Record<string, string | string[] | undefined>;
  user?: unknown;
};

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authHeaderRaw = request.headers.authorization;
    const authHeader = Array.isArray(authHeaderRaw) ? authHeaderRaw[0] : authHeaderRaw;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpError(401, 'Authorization token is missing or malformed');
    }

    const token = authHeader.slice('Bearer '.length).trim();

    if (!token) {
      throw new HttpError(401, 'Authorization token is missing');
    }

    try {
      const payload = verifyAccessToken(token);
      request.user = payload;
      return true;
    } catch {
      throw new HttpError(401, 'Invalid or expired authorization token');
    }
  }
}
