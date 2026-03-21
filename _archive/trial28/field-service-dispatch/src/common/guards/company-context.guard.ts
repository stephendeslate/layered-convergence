import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class CompanyContextGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const companyId =
      request.headers['x-company-id'] || request.user?.companyId;

    if (!companyId) {
      throw new BadRequestException(
        'x-company-id header is required for tenant isolation',
      );
    }

    request.companyId = companyId;
    return true;
  }
}
