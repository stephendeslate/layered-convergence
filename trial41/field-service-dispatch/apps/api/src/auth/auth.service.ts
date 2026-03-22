import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
// TRACED: FD-AUTH-BCRYPT
import { BCRYPT_SALT_ROUNDS } from '@field-service-dispatch/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string, role: string, tenantId: string) {
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role: role as 'USER' | 'TECHNICIAN' | 'DISPATCHER',
        tenantId,
      },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
        createdAt: true,
      },
    });
    return user;
  }

  async login(email: string, password: string) {
    // findFirst: used because email has unique constraint but findFirst
    // allows consistent error handling pattern across the codebase
    const user = await this.prisma.user.findFirst({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        tenantId: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  async getProfile(userId: string) {
    // findFirst: user id comes from JWT, guaranteed unique
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
