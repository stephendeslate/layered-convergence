import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    return this.prisma.user.create({ data: dto });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOneOrThrow(id: string) {
    return this.prisma.user.findFirstOrThrow({
      where: { id },
      include: {
        buyerTransactions: true,
        providerTransactions: true,
        connectedAccount: true,
      },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.prisma.user.findFirstOrThrow({ where: { id } });
    return this.prisma.user.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.prisma.user.findFirstOrThrow({ where: { id } });
    return this.prisma.user.delete({ where: { id } });
  }
}
