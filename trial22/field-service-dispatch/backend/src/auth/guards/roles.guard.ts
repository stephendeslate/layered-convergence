import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) =>
  import('@nestjs/common').then(({ SetMetadata }) => SetMetadata(ROLES_KEY, roles));

// TRACED:SEC-003 Two roles enforced: DISPATCHER and TECHNICIAN
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: { role: string } }>();
    const user = request.user;

    return requiredRoles.includes(user.role);
  }
}
