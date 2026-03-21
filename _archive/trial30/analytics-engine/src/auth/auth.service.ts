import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async validateApiKey(apiKey: string) {
    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { apiKey },
    });

    if (!tenant) {
      throw new UnauthorizedException('Invalid API key');
    }

    return tenant;
  }

  async validateTenantAccess(apiKey: string, tenantId: string): Promise<boolean> {
    const tenant = await this.validateApiKey(apiKey);
    return tenant.id === tenantId;
  }
}
