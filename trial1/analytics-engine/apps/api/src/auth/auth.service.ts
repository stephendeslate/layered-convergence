import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

export interface JwtPayload {
  sub: string; // tenant ID
  email: string;
  tier: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly bcryptRounds: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {
    this.bcryptRounds =
      process.env.NODE_ENV === 'test'
        ? 4
        : parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10);
  }

  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<AuthTokens> {
    const existing = await this.prisma.tenant.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, this.bcryptRounds);

    const tenant = await this.prisma.tenant.create({
      data: {
        name,
        email,
        passwordHash,
        emailVerified: false,
      },
    });

    return this.generateTokens(tenant);
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { email },
    });

    if (!tenant) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (tenant.deletedAt) {
      throw new UnauthorizedException('Account has been deleted');
    }

    const valid = await bcrypt.compare(password, tenant.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(tenant);
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: process.env.JWT_SECRET ?? 'change-me-in-production',
      });

      const tenant = await this.prisma.tenant.findUnique({
        where: { id: payload.sub },
      });

      if (!tenant || tenant.deletedAt) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(tenant);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateTenant(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant || tenant.deletedAt) {
      throw new UnauthorizedException('Tenant not found');
    }

    return tenant;
  }

  async validateApiKey(keyHash: string) {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { keyHash },
      include: { tenant: true },
    });

    if (!apiKey || !apiKey.isActive || apiKey.revokedAt) {
      throw new UnauthorizedException('Invalid API key');
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      throw new UnauthorizedException('API key expired');
    }

    // Update lastUsedAt
    await this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });

    return apiKey;
  }

  private generateTokens(tenant: {
    id: string;
    email: string;
    tier: string;
  }): AuthTokens {
    const payload: Record<string, unknown> = {
      sub: tenant.id,
      email: tenant.email,
      tier: tenant.tier,
    };

    const secret = process.env.JWT_SECRET ?? 'change-me-in-production';

    return {
      accessToken: this.jwtService.sign(payload, {
        secret,
        expiresIn: 86400, // 24 hours in seconds
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret,
        expiresIn: 604800, // 7 days in seconds
      }),
    };
  }
}
