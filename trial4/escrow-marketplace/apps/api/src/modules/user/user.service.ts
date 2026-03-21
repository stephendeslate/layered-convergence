import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';

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

  async findAll() {
    return this.prisma.user.findMany({
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
    return this.prisma.user.findFirstOrThrow({
      where: { id },
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

  async findByEmail(email: string) {
    return this.prisma.user.findFirstOrThrow({
      where: { email },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.prisma.user.findFirstOrThrow({ where: { id } });
    return this.prisma.user.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    await this.prisma.user.findFirstOrThrow({ where: { id } });
    return this.prisma.user.delete({ where: { id } });
  }
}
