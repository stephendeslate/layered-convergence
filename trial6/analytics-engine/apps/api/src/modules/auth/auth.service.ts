import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async validateApiKey(apiKey: string) {
    const tenant = await this.prisma.tenant.findFirstOrThrow({
      where: { apiKey },
    });
    return tenant;
  }

  async login(dto: { apiKey: string }) {
    try {
      const tenant = await this.validateApiKey(dto.apiKey);
      return { tenantId: tenant.id, name: tenant.name, apiKey: tenant.apiKey };
    } catch {
      throw new UnauthorizedException('Invalid API key');
    }
  }
}
