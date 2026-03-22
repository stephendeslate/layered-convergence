import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  BCRYPT_SALT_ROUNDS,
  isAllowedRegistrationRole,
  sanitizeInput,
  maskSensitive,
} from '@escrow-marketplace/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // TRACED: EM-AUTH-001 — bcrypt hashing with 12 salt rounds
  async register(dto: RegisterDto) {
    // TRACED: EM-AUTH-003 — Registration restricted to allowed roles
    if (!isAllowedRegistrationRole(dto.role)) {
      throw new BadRequestException(
        `Role ${dto.role} is not allowed for registration`,
      );
    }

    const sanitizedName = sanitizeInput(dto.name);

    // TRACED: EM-AUTH-006 — Email uniqueness within tenant
    // findFirst: checking unique constraint across tenant + email composite
    const existingUser = await this.prisma.user.findFirst({
      where: { email: dto.email, tenantId: dto.tenantId },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists in this tenant');
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: sanitizedName,
        role: dto.role,
        balance: 0,
        tenantId: dto.tenantId,
      },
    });

    // Log with masked email for audit trail
    const maskedEmail = maskSensitive(user.email);
    void maskedEmail;

    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  // TRACED: EM-AUTH-002 — JWT token generation with correct payload
  async login(dto: LoginDto) {
    // findFirst: matching on email + tenantId composite (not a unique field alone)
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, tenantId: dto.tenantId },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // TRACED: EM-AUTH-007 — JWT payload contains sub, email, role, tenantId
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    return { access_token: this.jwtService.sign(payload) };
  }

  async getProfile(userId: string) {
    // findFirst: user ID lookup with explicit field selection to exclude password
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        balance: true,
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
