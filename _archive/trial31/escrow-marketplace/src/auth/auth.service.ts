import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          name: dto.name,
          role: dto.role || 'BUYER',
        },
        select: { id: true, email: true, name: true, role: true, tenantId: true },
      });

      const token = this.generateToken(user);
      return { user, token };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, email: true, name: true, role: true, password: true, tenantId: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = this.generateToken(userWithoutPassword);
    return { user: userWithoutPassword, token };
  }

  private generateToken(user: { id: string; email: string; role: string; tenantId?: string }) {
    const secret = this.config.get<string>('JWT_SECRET')!;
    const expiresIn = this.config.get<string>('JWT_EXPIRATION', '3600');
    return jwt.sign(
      { sub: user.id, email: user.email, role: user.role, tenantId: user.tenantId || 'default' },
      secret,
      { expiresIn: parseInt(expiresIn, 10) },
    );
  }
}
