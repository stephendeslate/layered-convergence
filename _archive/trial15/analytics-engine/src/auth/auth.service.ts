import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async validateApiKey(tenantId: string, apiKey: string): Promise<boolean> {
    // findFirst: tenant lookup by composite key (tenantId + apiKey) — no unique constraint on this pair
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: tenantId, apiKey },
    });
    return tenant !== null;
  }
}
