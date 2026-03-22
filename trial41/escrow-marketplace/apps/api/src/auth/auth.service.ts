// TRACED:EM-AUTH-01 auth service with bcrypt and JWT
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { BCRYPT_SALT_ROUNDS } from '@em/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // findFirst: check if user already exists before creating
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role as 'BUYER' | 'SELLER',
        tenantId: dto.tenantId,
      },
      select: { id: true, email: true, role: true, tenantId: true },
    });

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    return { user, token };
  }

  async login(dto: LoginDto) {
    // findFirst: look up user by email for authentication
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
      select: { id: true, email: true, passwordHash: true, role: true, tenantId: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    return {
      user: { id: user.id, email: user.email, role: user.role, tenantId: user.tenantId },
      token,
    };
  }
}
