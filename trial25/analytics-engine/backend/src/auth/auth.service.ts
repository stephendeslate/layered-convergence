import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { BCRYPT_SALT_ROUNDS } from '../common/constants';

// [TRACED:SEC-007] AuthService handles registration and login with bcrypt + JWT
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto, tenantId: string): Promise<{ accessToken: string }> {
    // findFirst used here to check for existing email within a tenant scope
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email, tenantId },
    });

    if (existing) {
      throw new ConflictException('Email already registered in this tenant');
    }

    // [TRACED:SEC-008] Password hashed with bcrypt salt 12
    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: dto.role as 'VIEWER' | 'EDITOR' | 'ANALYST',
        tenantId,
      },
    });

    const payload = { sub: user.id, email: user.email, role: user.role, tenantId };
    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`User registered: ${user.email}`);
    return { accessToken };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    // findFirst justified: lookup by email which may not be unique across tenants
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

    const payload = { sub: user.id, email: user.email, role: user.role, tenantId: user.tenantId };
    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`User logged in: ${user.email}`);
    return { accessToken };
  }
}
