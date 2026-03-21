import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, AuthResponse } from './auth.dto';

const ALLOWED_REGISTRATION_ROLES: Role[] = [Role.VIEWER, Role.EDITOR, Role.ANALYST];

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    // findFirst justified: checking existence by primary key for tenant validation
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: dto.tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const role = dto.role ?? Role.VIEWER;

    if (!ALLOWED_REGISTRATION_ROLES.includes(role)) {
      throw new BadRequestException(
        `Invalid role for registration. Allowed roles: ${ALLOWED_REGISTRATION_ROLES.join(', ')}`,
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        tenantId: dto.tenantId,
        role,
      },
    });

    const payload = { sub: user.id, tenantId: user.tenantId, role: user.role };
    const token = await this.jwtService.signAsync(payload);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tenantId: user.tenantId,
        role: user.role,
      },
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    // findFirst justified: email is unique but need password field for bcrypt.compare
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

    const payload = { sub: user.id, tenantId: user.tenantId, role: user.role };
    const token = await this.jwtService.signAsync(payload);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tenantId: user.tenantId,
        role: user.role,
      },
    };
  }
}
