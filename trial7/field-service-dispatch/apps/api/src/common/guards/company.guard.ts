import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class CompanyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const companyId = request.headers['x-company-id'] as string;

    if (!companyId) {
      throw new UnauthorizedException('Company ID is required');
    }

    (request as Record<string, unknown>)['companyId'] = companyId;
    return true;
  }
}
