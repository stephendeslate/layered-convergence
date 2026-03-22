import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { RegisterDto, LoginDto } from './auth.dto';
import {
  BCRYPT_SALT_ROUNDS,
  isAllowedRegistrationRole,
  sanitizeInput,
  maskSensitive,
} from '@analytics-engine/shared';
import type { UserRole } from '@analytics-engine/shared';

// TRACED: AE-AUTH-004
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    if (!isAllowedRegistrationRole(dto.role)) {
      throw new UnauthorizedException('Invalid registration role');
    }

    // TRACED: AE-SEC-006
    const sanitizedName = sanitizeInput(dto.name);

    // findFirst used here because tenant lookup is by slug (unique field),
    // but we need the full tenant object for the relation
    const tenant = await this.prisma.tenant.findFirst({
      where: { slug: dto.tenantSlug },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const existingUser = await this.prisma.user.findFirst({
      // findFirst: checking email uniqueness before insert for better error message
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // TRACED: AE-AUTH-005
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: dto.email,
        name: sanitizedName,
        passwordHash,
        role: dto.role as UserRole,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
      },
    });

    // TRACED: AE-AUTH-008
    const maskedEmail = maskSensitive(user.email, 4);
    process.stderr.write(`User registered: ${maskedEmail}\n`);

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    return { user, token };
  }

  // TRACED: AE-AUTH-006
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      // findFirst: email is unique, used for login credential lookup
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

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
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      },
      token,
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findFirst({
      // findFirst: used by JWT strategy to validate token subject against DB
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
