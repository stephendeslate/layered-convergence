// TRACED:AE-AUTH-04 — AuthService with bcrypt salt 12, withTimeout for hashing
// TRACED:AE-PERF-07 — withTimeout wraps bcrypt.hash to guard against slow hashing

import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  BCRYPT_SALT_ROUNDS,
  withTimeout,
  maskSensitive,
} from '@analytics-engine/shared';

const HASH_TIMEOUT_MS = 10_000;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // findFirst: checking email uniqueness before insert
    const existingUser = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await withTimeout(
      () => bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS),
      HASH_TIMEOUT_MS,
    );

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        displayName: dto.displayName,
        role: dto.role,
        tenantId: dto.tenantId,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        tenantId: true,
        createdAt: true,
      },
    });

    this.logger.log(`User registered: ${maskSensitive(user.email)}`);

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    return { user, token };
  }

  async login(dto: LoginDto) {
    // findFirst: login lookup by email — unique constraint exists but using findFirst for consistency
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await withTimeout(
      () => bcrypt.compare(dto.password, user.passwordHash),
      HASH_TIMEOUT_MS,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`User logged in: ${maskSensitive(user.email)}`);

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        tenantId: user.tenantId,
      },
      token,
    };
  }
}
