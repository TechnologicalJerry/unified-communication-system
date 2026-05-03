import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { HttpError } from '../lib/http-error';
import type { UserRole } from '../types/user.roles';

export function requireRoles(allowedRoles: UserRole[]): any {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(new HttpError(401, 'Unauthorized'));
    }

    if (!allowedRoles.includes(user.role as UserRole)) {
      return next(new HttpError(403, 'Forbidden'));
    }

    next();
  };
}
