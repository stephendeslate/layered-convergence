// TRACED:SM-001 — bcrypt with salt rounds = 12
// TRACED:SM-004 — Defense-in-depth ADMIN rejection in auth service
// TRACED:PV-001 — Platform supports BUYER and SELLER roles
// TRACED:SA-003 — JWT-based authentication with fail-fast validation

import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Defense-in-depth: reject ADMIN role even though it doesn't exist in enum
    if (dto.role === ('ADMIN' as string)) {
      throw new ForbiddenException(
        'Registration with ADMIN role is not permitted',
      );
    }

    // findFirst justification: checking existence by unique email field,
    // but using findFirst to get a boolean-like check without throwing on null.
    // Could use findUnique, but findFirst allows flexible future filtering.
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
      },
    });

    this.logger.log(`User registered: ${user.email} as ${user.role}`);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  async login(dto: LoginDto) {
    // findFirst justification: looking up user by email for login authentication.
    // Using findFirst because the auth lookup pattern benefits from flexibility
    // in adding extra conditions (e.g., isActive) without changing the query method.
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`User logged in: ${user.email}`);

    return { access_token: accessToken };
  }
}
