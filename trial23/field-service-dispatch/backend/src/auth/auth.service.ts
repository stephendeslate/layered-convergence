// TRACED:BCRYPT_SALT_12 — bcrypt uses exactly 12 salt rounds
// TRACED:JWT_PAYLOAD — JWT payload contains sub, email, role, companyId
// TRACED:ROLE_NO_ADMIN — Only DISPATCHER and TECHNICIAN roles exist; ADMIN is excluded from registration

import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    if (dto.role !== 'DISPATCHER' && dto.role !== 'TECHNICIAN') {
      throw new BadRequestException('Invalid role. Only DISPATCHER and TECHNICIAN are allowed.');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role,
        companyId: dto.companyId,
      },
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(email: string, password: string) {
    // findFirst justified: looking up user by email for authentication; email is unique but using findFirst for flexibility
    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    return user;
  }
}
