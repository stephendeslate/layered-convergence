import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;

  constructor(private readonly prisma: PrismaService) {
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret-change-in-production';
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const company = await this.prisma.company.create({
      data: { name: dto.companyName },
    });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: 'ADMIN',
        companyId: company.id,
      },
    });

    const token = this.signToken(user.id, user.companyId, user.email, user.role);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        companyId: user.companyId,
        role: user.role,
      },
    };
  }

  async login(dto: LoginDto) {
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

    const token = this.signToken(user.id, user.companyId, user.email, user.role);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        companyId: user.companyId,
        role: user.role,
      },
    };
  }

  private signToken(userId: string, companyId: string, email: string, role: string): string {
    return jwt.sign(
      { sub: userId, companyId, email, role },
      this.jwtSecret,
      { expiresIn: '24h' },
    );
  }
}
