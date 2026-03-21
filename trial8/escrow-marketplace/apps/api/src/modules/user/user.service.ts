import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    this.logger.log(`Creating ${dto.role} user: ${dto.email}`);
    return this.prisma.user.create({ data: dto });
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: { connectedAccount: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id },
      include: { connectedAccount: true },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  async findByRole(role: string) {
    return this.prisma.user.findMany({
      where: { role },
      include: { connectedAccount: true },
    });
  }
}
