import type { JwtPayload } from '../lib/jwt';

export type AuthUser = JwtPayload;

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
