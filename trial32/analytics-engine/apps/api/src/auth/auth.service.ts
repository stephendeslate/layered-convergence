// [TRACED:AE-PV-007] ADMIN role rejected at registration to prevent privilege escalation
// [TRACED:AE-SM-004] bcrypt salt rounds = 12
// [TRACED:AE-SM-005] ADMIN role rejected at registration
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { REGISTERABLE_ROLES } from '@analytics-engine/shared';

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: { email: string; password: string; role: string; tenantId: string }) {
    const roleValues = REGISTERABLE_ROLES.map((r) => String(r));
    if (!roleValues.includes(data.role)) {
      throw new BadRequestException(`Role must be one of: ${roleValues.join(', ')}`);
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: data.role as 'VIEWER' | 'EDITOR' | 'ANALYST',
        tenantId: data.tenantId,
      },
    });

    return { id: user.id, email: user.email, role: user.role };
  }

  async login(data: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role, tenantId: user.tenantId };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
