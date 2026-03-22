// TRACED: EM-AUTH-001 — JWT authentication with bcrypt hashing
// TRACED: EM-AUTH-002 — bcrypt with BCRYPT_SALT_ROUNDS constant
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { BCRYPT_SALT_ROUNDS, withTimeout } from '@escrow-marketplace/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ access_token: string }> {
    // findFirst: checking email+tenant uniqueness before insert
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
        tenantId: dto.tenantId,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered for this tenant');
    }

    // TRACED: EM-PERF-005 — withTimeout wrapping bcrypt hash
    const hashedPassword = await withTimeout(
      () => bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS),
      5000,
    );

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: dto.role as 'MANAGER' | 'SELLER' | 'BUYER',
        tenantId: dto.tenantId,
      },
    });

    const payload = { sub: user.id, email: user.email, role: user.role, tenantId: user.tenantId };
    return { access_token: this.jwtService.sign(payload) };
  }

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    // findFirst: email+tenant lookup for login
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
        tenantId: dto.tenantId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await withTimeout(
      () => bcrypt.compare(dto.password, user.password),
      5000,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role, tenantId: user.tenantId };
    return { access_token: this.jwtService.sign(payload) };
  }

  async validateUser(userId: string): Promise<{ id: string; email: string; role: string; tenantId: string } | null> {
    // findFirst: JWT validation user lookup by ID
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
      select: { id: true, email: true, role: true, tenantId: true },
    });
    return user;
  }
}
