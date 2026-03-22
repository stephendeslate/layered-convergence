// TRACED: FD-AUTH-003 — Auth service with bcrypt salt 12 and withTimeout
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  BCRYPT_SALT_ROUNDS,
  isAllowedRegistrationRole,
  sanitizeInput,
  maskSensitive,
  withTimeout,
} from '@field-service-dispatch/shared';

const HASH_TIMEOUT_MS = 5000;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    if (!isAllowedRegistrationRole(dto.role)) {
      throw new ConflictException('Invalid registration role');
    }

    const sanitizedEmail = sanitizeInput(dto.email);

    // findFirst: checking email uniqueness scoped by tenant before insert
    const existing = await this.prisma.user.findFirst({
      where: { email: sanitizedEmail, tenantId: dto.tenantId },
    });

    if (existing) {
      throw new ConflictException('Email already registered for this tenant');
    }

    const hashedPassword = await withTimeout(
      () => bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS),
      HASH_TIMEOUT_MS,
    );

    const user = await this.prisma.user.create({
      data: {
        email: sanitizedEmail,
        passwordHash: hashedPassword,
        role: dto.role,
        tenantId: dto.tenantId,
      },
    });

    const token = this.jwt.sign({
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
    });

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: maskSensitive(user.email, 6),
        role: user.role,
      },
    };
  }

  async login(dto: LoginDto) {
    // findFirst: login lookup — email unique per tenant, using findFirst for multi-tenant safety
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, tenantId: dto.tenantId },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwt.sign({
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
    });

    return {
      accessToken: token,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
