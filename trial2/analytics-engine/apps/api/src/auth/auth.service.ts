import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { hashApiKey, generateApiKey } from '../common/encryption';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(slug: string, apiKey: string): Promise<{ accessToken: string; expiresIn: number }> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });

    if (!tenant) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const keyHash = hashApiKey(apiKey);
    if (keyHash !== tenant.apiKeyHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: tenant.id, tenantSlug: tenant.slug };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken, expiresIn: 86400 };
  }

  async validateApiKey(apiKey: string): Promise<{ tenantId: string; tenantName: string } | null> {
    const keyHash = hashApiKey(apiKey);
    const tenant = await this.prisma.tenant.findFirst({
      where: { apiKeyHash: keyHash },
    });

    if (!tenant) {
      return null;
    }

    return { tenantId: tenant.id, tenantName: tenant.name };
  }

  async regenerateApiKey(tenantId: string): Promise<string> {
    const newKey = generateApiKey();
    const newHash = hashApiKey(newKey);

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { apiKey: newKey, apiKeyHash: newHash },
    });

    return newKey;
  }
}
