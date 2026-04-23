import type { NextFunction, Request, Response } from 'express';

import { HttpError } from '../lib/http-error';
import type { UserRole } from '../modules/users/user.roles';

export function requireRoles(allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const actor = req.user;

    if (!actor || !allowedRoles.includes(actor.role)) {
      next(new HttpError(403, 'Insufficient permissions for this action'));
      return;
    }

    next();
  };
}
