import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto } from './company.dto';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCompanyDto) {
    return this.prisma.company.create({
      data: {
        name: dto.name,
        primaryColor: dto.primaryColor ?? '#3B82F6',
        logoUrl: dto.logoUrl,
        serviceArea: dto.serviceArea ?? null,
      },
    });
  }

  async findAll() {
    return this.prisma.company.findMany({
      include: {
        _count: {
          select: { technicians: true, customers: true, workOrders: true },
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.company.findFirstOrThrow({
      where: { id },
      include: {
        _count: {
          select: { technicians: true, customers: true, workOrders: true },
        },
      },
    });
  }

  async update(id: string, dto: UpdateCompanyDto) {
    await this.prisma.company.findFirstOrThrow({ where: { id } });
    return this.prisma.company.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    await this.prisma.company.findFirstOrThrow({ where: { id } });
    return this.prisma.company.delete({ where: { id } });
  }
}
