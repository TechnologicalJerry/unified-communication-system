import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { HttpError } from '../../lib/http-error';
import type { AuthUser } from '../types/auth-user';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { UserRole } from '../../modules/users/user.roles';

type RequestWithUser = {
  user?: AuthUser;
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();

    if (!request.user || !requiredRoles.includes(request.user.role)) {
      throw new HttpError(403, 'Insufficient permissions for this action');
    }

    return true;
  }
}
