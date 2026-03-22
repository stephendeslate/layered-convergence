// TRACED:AE-AUTH-SERVICE
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ accessToken: string }> {
    // findFirst justified: checking email uniqueness before insert
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: dto.role as 'USER' | 'VIEWER' | 'EDITOR',
        tenantId: dto.tenantId,
      },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
      },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    return { accessToken: this.jwtService.sign(payload) };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    // findFirst justified: looking up user by unique email for authentication
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        tenantId: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    return { accessToken: this.jwtService.sign(payload) };
  }

  async getProfile(userId: string) {
    // findFirst justified: fetching profile by authenticated user's ID
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
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
