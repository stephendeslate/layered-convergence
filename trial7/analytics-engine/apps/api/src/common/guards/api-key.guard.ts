import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    const tenant = await this.prisma.tenant.findFirst({
      where: { apiKey },
    });

    if (!tenant) {
      throw new UnauthorizedException('Invalid API key');
    }

    (request as Record<string, unknown>)['tenantId'] = tenant.id;
    (request as Record<string, unknown>)['tenant'] = tenant;

    return true;
  }
}
