import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { RegisterDto, LoginDto } from './auth.dto';
import { isAllowedRegistrationRole } from '@escrow-marketplace/shared';

// TRACED: EM-SEC-BCRYPT-001 — bcrypt salt rounds = 12
const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // TRACED: EM-SEC-ROLES-003 — Server-side role validation via shared utility
    if (!isAllowedRegistrationRole(dto.role)) {
      throw new UnauthorizedException('Invalid registration role');
    }

    // findFirst: checking for existing user by unique email before insert
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hash,
        name: dto.name,
        tenantId: dto.tenantId,
        role: dto.role as 'OWNER' | 'BUYER' | 'SELLER',
      },
    });

    const token = this.jwt.sign({ userId: user.id, tenantId: user.tenantId, role: user.role });
    return { access_token: token };
  }

  async login(dto: LoginDto) {
    // findFirst: looking up user by email for authentication
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwt.sign({ userId: user.id, tenantId: user.tenantId, role: user.role });
    return { access_token: token };
  }

  async getProfile(userId: string) {
    // findFirst: looking up specific user by ID for profile retrieval
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }
}
