import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCompanyDto) {
    return this.prisma.company.create({ data: dto });
  }

  async findAll() {
    return this.prisma.company.findMany({
      include: { _count: { select: { technicians: true, workOrders: true } } },
    });
  }

  async findOne(id: string) {
    return this.prisma.company.findFirstOrThrow({
      where: { id },
      include: { technicians: true },
    });
  }

  async update(id: string, dto: UpdateCompanyDto) {
    return this.prisma.company.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.company.delete({ where: { id } });
  }
}
