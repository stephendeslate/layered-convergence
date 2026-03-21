import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { RegisterDto } from './dto/login.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    return this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        role: UserRole.BUYER,
      },
    });
  }

  async login(email: string) {
    const user = await this.prisma.user.findFirstOrThrow({
      where: { email },
    });
    return { userId: user.id, email: user.email, role: user.role };
  }

  async findById(id: string) {
    return this.prisma.user.findFirstOrThrow({ where: { id } });
  }
}
