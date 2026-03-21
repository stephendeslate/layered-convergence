import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';

/**
 * Guard that validates the x-company-id header and attaches the company
 * to the request. Sets RLS context for tenant isolation.
 */
@Injectable()
export class CompanyGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const companyId = request.headers['x-company-id'] as string;

    if (!companyId) {
      throw new UnauthorizedException('Missing company ID');
    }

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new UnauthorizedException('Invalid company');
    }

    (request as Record<string, unknown>)['company'] = company;
    return true;
  }
}
