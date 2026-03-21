import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async validateApiKey(apiKey: string): Promise<{ tenantId: string }> {
    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    const tenant = await this.prisma.tenant.findFirst({
      where: { apiKey },
    });

    if (!tenant) {
      throw new UnauthorizedException('Invalid API key');
    }

    return { tenantId: tenant.id };
  }
}
