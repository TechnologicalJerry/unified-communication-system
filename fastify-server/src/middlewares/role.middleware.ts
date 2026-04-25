import type { FastifyReply, FastifyRequest } from 'fastify';

import { HttpError } from '../lib/http-error';
import type { UserRole } from '../modules/users/user.roles';

export function requireRoles(allowedRoles: UserRole[]) {
  return async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const actor = req.user;

    if (!actor || !allowedRoles.includes(actor.role)) {
      throw new HttpError(403, 'Insufficient permissions for this action');
    }
  };
}
