import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { Request } from 'express';

/**
 * Guard that verifies the x-company-id header is present and valid.
 * Attaches the company to the request for downstream RLS scoping.
 */
@Injectable()
export class CompanyGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const companyId = request.headers['x-company-id'] as string;

    if (!companyId) {
      throw new UnauthorizedException('Company identity required');
    }

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new UnauthorizedException('Invalid company');
    }

    (request as Record<string, unknown>)['company'] = company;
    (request as Record<string, unknown>)['companyId'] = companyId;
    return true;
  }
}
