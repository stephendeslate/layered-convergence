// [TRACED:SEC-004] bcrypt salt 12 for password hashing
// [TRACED:SEC-005] ADMIN role rejection in registration service
// [TRACED:PV-007] ADMIN role rejected at registration — enforced at service + DTO levels

import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ access_token: string }> {
    if ((dto.role as string) === 'ADMIN') {
      throw new BadRequestException('ADMIN role is not allowed');
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
        tenantId: dto.tenantId,
      },
    });

    const payload = { sub: user.id, email: user.email, role: user.role, tenantId: user.tenantId };
    return { access_token: this.jwtService.sign(payload) };
  }

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    // findFirst: querying by email which is unique, but using findFirst for consistent error handling pattern
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role, tenantId: user.tenantId };
    return { access_token: this.jwtService.sign(payload) };
  }

  async validateUser(userId: string): Promise<{ id: string; email: string; role: string; tenantId: string }> {
    // findFirst: querying by id which is unique, but using findFirst for flexible null handling
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return { id: user.id, email: user.email, role: user.role, tenantId: user.tenantId };
  }
}
