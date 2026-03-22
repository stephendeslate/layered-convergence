// TRACED: AE-AUTH-03
// TRACED: AE-AUTH-04
// TRACED: AE-SEC-07
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { BCRYPT_SALT_ROUNDS, slugify, measureDuration } from '@analytics-engine/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // findFirst: checking if email exists across all tenants (not unique per tenant)
    const existingUser = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Use measureDuration from shared to time password hashing
    const { result: passwordHash } = await measureDuration(() =>
      bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS),
    );

    const tenantSlug = slugify(dto.name);

    const tenant = await this.prisma.tenant.create({
      data: {
        name: `${dto.name}'s Workspace`,
        slug: `${tenantSlug}-${Date.now()}`,
      },
    });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        role: dto.role as 'ADMIN' | 'EDITOR' | 'VIEWER',
        tenantId: tenant.id,
      },
    });

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
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  async login(dto: LoginDto) {
    // findFirst: looking up user by email which may not be the Prisma @id field
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordValid) {
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
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }
}
