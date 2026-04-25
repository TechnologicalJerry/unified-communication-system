import type { FastifyReply, FastifyRequest } from 'fastify';

import { HttpError } from '../lib/http-error';
import { verifyAccessToken } from '../lib/jwt';

export async function authMiddleware(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HttpError(401, 'Authorization token is missing or malformed');
  }

  const token = authHeader.slice('Bearer '.length).trim();

  if (!token) {
    throw new HttpError(401, 'Authorization token is missing');
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
  } catch {
    throw new HttpError(401, 'Invalid or expired authorization token');
  }
}
