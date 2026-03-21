// [TRACED:FD-PV-007] DISPATCHER role assigned at registration
// [TRACED:FD-PV-008] ADMIN role rejected at registration
// [TRACED:FD-SM-004] bcrypt salt rounds = 12
// [TRACED:FD-SM-005] ADMIN role rejected at service level
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { REGISTERABLE_ROLES } from '@field-service-dispatch/shared';

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: { email: string; password: string; role: string; companyId: string }) {
    const roleValues = REGISTERABLE_ROLES.map((r) => String(r));
    if (!roleValues.includes(data.role)) {
      throw new BadRequestException(`Role must be one of: ${roleValues.join(', ')}`);
    }

    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: data.role as 'DISPATCHER' | 'TECHNICIAN' | 'MANAGER',
        companyId: data.companyId,
      },
    });

    return { id: user.id, email: user.email, role: user.role };
  }

  async login(data: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role, companyId: user.companyId };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
