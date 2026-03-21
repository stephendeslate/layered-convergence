import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;

  constructor(private readonly prisma: PrismaService) {}

  async register(
    dto: RegisterDto,
  ): Promise<{ id: string; email: string; role: string }> {
    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    // findFirst is used here because Prisma's unique constraint check
    // needs to happen before insert to provide meaningful error messages
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (existing) {
      throw new UnauthorizedException('Email already registered');
    }

    // Get or create a default company for registration
    let company = await this.prisma.company.findFirst({
      where: { domain: 'default.example.com' },
    });

    if (!company) {
      company = await this.prisma.company.create({
        data: {
          name: 'Default Company',
          domain: 'default.example.com',
        },
      });
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        role: dto.role,
        companyId: company.id,
      },
    });

    return { id: user.id, email: user.email, role: user.role };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
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

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '24h' },
    );

    return { accessToken };
  }
}
