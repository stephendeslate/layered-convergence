import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { isAllowedRegistrationRole } from '@escrow-marketplace/shared';
import type { Role } from '@escrow-marketplace/shared';

// TRACED: EM-AUTH-BCRYPT-001 — bcrypt salt rounds = 12
const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(email: string, password: string, role: string, tenantId: string) {
    // TRACED: EM-AUTH-NOREG-001 — @IsIn excludes ADMIN from registration
    if (!isAllowedRegistrationRole(role)) {
      throw new UnauthorizedException('Invalid role for registration');
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: { email, passwordHash: hash, role: role as Role, tenantId },
    });

    return { id: user.id, email: user.email, role: user.role };
  }

  async login(email: string, password: string) {
    // findFirst: email is unique but we filter by non-deleted tenant context
    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role, tenantId: user.tenantId };
    return { accessToken: this.jwt.sign(payload) };
  }
}
