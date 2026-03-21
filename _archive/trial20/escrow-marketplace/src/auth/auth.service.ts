import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: dto.password,
        role: dto.role,
      },
    });

    const token = Buffer.from(`${user.email}:${user.password}`).toString(
      'base64',
    );

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || user.password !== dto.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = Buffer.from(`${user.email}:${user.password}`).toString(
      'base64',
    );

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      token,
    };
  }
}
