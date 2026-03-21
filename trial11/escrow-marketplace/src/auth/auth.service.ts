import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { UserRole } from '../../generated/prisma/client.js';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    const passwordHash = Buffer.from(dto.password).toString('base64');

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        role: dto.role,
        passwordHash,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      token: this.generateToken(user.id),
    };
  }

  async login(email: string, password: string) {
    // findFirst justified: looking up user by email for auth, unique constraint ensures single result
    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = this.validatePassword(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      token: this.generateToken(user.id),
    };
  }

  validatePassword(password: string, hash: string): boolean {
    return Buffer.from(password).toString('base64') === hash;
  }

  generateToken(userId: string): string {
    return Buffer.from(JSON.stringify({ userId, iat: Date.now() })).toString('base64');
  }

  parseToken(token: string): { userId: string } | null {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
      if (decoded && typeof decoded.userId === 'string') {
        // type assertion justified: we validated that decoded has userId string field above
        return decoded as { userId: string };
      }
      return null;
    } catch {
      return null;
    }
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
