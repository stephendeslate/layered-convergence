import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.company.findUniqueOrThrow({ where: { id } });
  }

  async update(id: string, data: { name?: string; address?: string; phone?: string; email?: string }) {
    return this.prisma.company.update({ where: { id }, data });
  }
}
