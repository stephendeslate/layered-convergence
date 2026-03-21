import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

/**
 * Ensures the user can only access resources belonging to their company.
 * Checks :companyId route param matches the JWT companyId.
 */
@Injectable()
export class CompanyAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const paramCompanyId = request.params?.companyId;

    // If no companyId in params, allow (company scoping handled by RLS)
    if (!paramCompanyId) {
      return true;
    }

    if (user.companyId !== paramCompanyId) {
      throw new ForbiddenException('Access denied: cross-tenant access is not allowed');
    }

    return true;
  }
}
