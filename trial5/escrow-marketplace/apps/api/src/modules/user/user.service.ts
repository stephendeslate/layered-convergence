import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        role: dto.role,
      },
    });
  }

  async findAll(role?: UserRole) {
    return this.prisma.user.findMany({
      where: role ? { role } : undefined,
      include: {
        stripeAccount: true,
        _count: {
          select: {
            buyerTransactions: true,
            providerTransactions: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id },
      include: {
        stripeAccount: true,
        buyerTransactions: { take: 10, orderBy: { createdAt: 'desc' } },
        providerTransactions: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.prisma.user.findUniqueOrThrow({ where: { id } });
    return this.prisma.user.update({
      where: { id },
      data: dto,
    });
  }
}
