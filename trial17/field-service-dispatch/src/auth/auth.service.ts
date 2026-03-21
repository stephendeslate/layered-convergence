import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error('JWT_SECRET environment variable is required');
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    const company = await this.prisma.company.create({
      data: { name: dto.companyName },
    });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: dto.password,
        name: dto.name,
        role: 'ADMIN',
        companyId: company.id,
      },
    });

    const token = jwt.sign(
      { userId: user.id, companyId: company.id, role: user.role },
      secret!,
      { expiresIn: '24h' },
    );

    return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }

  async login(dto: LoginDto) {
    // findFirst: required because login identifies user by email + companyId (not a unique PK)
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, companyId: dto.companyId },
    });

    if (!user || user.password !== dto.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user.id, companyId: user.companyId, role: user.role },
      secret!,
      { expiresIn: '24h' },
    );

    return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }
}
