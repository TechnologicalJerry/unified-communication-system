import type { JwtPayload } from '../lib/jwt';

export type AuthUser = JwtPayload;

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}
