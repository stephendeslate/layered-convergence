// TRACED: FD-AUTH-003 — Auth service with bcrypt salt 12
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { RegisterDto, LoginDto } from './dto';
import { BCRYPT_SALT_ROUNDS, isAllowedRegistrationRole } from '@field-service-dispatch/shared';

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

    // findFirst: checking uniqueness before insert — email is unique per tenant
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email, tenantId: dto.tenantId },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        role: dto.role,
        tenantId: dto.tenantId,
      },
    });

    const token = this.jwt.sign({ sub: user.id, tenantId: user.tenantId, role: user.role });
    return { accessToken: token, user: { id: user.id, email: user.email, role: user.role } };
  }

  async login(dto: LoginDto) {
    // findFirst: login lookup — email should be unique per tenant but using findFirst for safety
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

    const token = this.jwt.sign({ sub: user.id, tenantId: user.tenantId, role: user.role });
    return { accessToken: token, user: { id: user.id, email: user.email, role: user.role } };
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
