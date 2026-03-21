import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Guard that validates the x-company-id header and attaches the company
 * to the request for downstream RLS scoping.
 */
@Injectable()
export class CompanyGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const companyId = request.headers['x-company-id'] as string | undefined;

    if (!companyId) {
      throw new UnauthorizedException('Missing company identification');
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
