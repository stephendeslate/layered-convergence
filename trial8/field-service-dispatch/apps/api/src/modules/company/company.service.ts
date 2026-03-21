import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { toJsonValue } from '../../common/helpers/json.helper';

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCompanyDto) {
    this.logger.log(`Creating company: ${dto.name}`);
    return this.prisma.company.create({
      data: {
        name: dto.name,
        primaryColor: dto.primaryColor,
        logoUrl: dto.logoUrl,
        serviceArea: dto.serviceArea ? toJsonValue(dto.serviceArea) : undefined,
      },
    });
  }

  async findAll() {
    return this.prisma.company.findMany({
      include: {
        _count: { select: { technicians: true, workOrders: true, customers: true } },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.company.findUniqueOrThrow({
      where: { id },
      include: {
        _count: { select: { technicians: true, workOrders: true, customers: true } },
      },
    });
  }

  async update(id: string, dto: UpdateCompanyDto) {
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.primaryColor !== undefined) data.primaryColor = dto.primaryColor;
    if (dto.logoUrl !== undefined) data.logoUrl = dto.logoUrl;
    if (dto.serviceArea !== undefined) data.serviceArea = toJsonValue(dto.serviceArea);

    return this.prisma.company.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.company.delete({ where: { id } });
  }
}
