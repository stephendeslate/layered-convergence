import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { toJsonField } from '../../common/helpers/json-field.helper';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCompanyDto) {
    return this.prisma.company.create({
      data: {
        name: dto.name,
        branding: dto.branding ? toJsonField(dto.branding) : undefined,
        serviceArea: dto.serviceArea ? toJsonField(dto.serviceArea) : undefined,
      },
    });
  }

  async findAll() {
    return this.prisma.company.findMany({
      include: { _count: { select: { technicians: true, workOrders: true } } },
    });
  }

  async findOneOrThrow(id: string) {
    return this.prisma.company.findFirstOrThrow({
      where: { id },
      include: { technicians: true, customers: true },
    });
  }

  async update(id: string, dto: UpdateCompanyDto) {
    await this.prisma.company.findFirstOrThrow({ where: { id } });
    return this.prisma.company.update({
      where: { id },
      data: {
        name: dto.name,
        branding: dto.branding ? toJsonField(dto.branding) : undefined,
        serviceArea: dto.serviceArea ? toJsonField(dto.serviceArea) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.prisma.company.findFirstOrThrow({ where: { id } });
    return this.prisma.company.delete({ where: { id } });
  }
}
