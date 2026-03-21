import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCompanyDto) {
    return this.prisma.company.create({ data: dto });
  }

  async findAll() {
    return this.prisma.company.findMany({
      include: {
        _count: {
          select: { technicians: true, workOrders: true, customers: true },
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.company.findUniqueOrThrow({
      where: { id },
      include: {
        technicians: true,
        _count: { select: { workOrders: true, customers: true } },
      },
    });
  }

  async update(id: string, dto: UpdateCompanyDto) {
    await this.prisma.company.findUniqueOrThrow({ where: { id } });
    return this.prisma.company.update({ where: { id }, data: dto });
  }
}
