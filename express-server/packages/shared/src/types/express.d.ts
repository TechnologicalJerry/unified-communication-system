import { JwtPayload } from '../lib/jwt';

declare global {
  namespace Express {
    export interface Request {
      user?: JwtPayload;
    }
  }
}

export {};
