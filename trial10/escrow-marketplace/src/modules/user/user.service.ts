import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    return this.prisma.user.create({ data: dto });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id },
      include: {
        buyerTransactions: true,
        providerTransactions: true,
        connectedAccount: true,
        payouts: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUniqueOrThrow({ where: { email } });
  }

  async update(id: string, data: Partial<CreateUserDto>) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
