import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto } from './company.dto';

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCompanyDto) {
    const company = await this.prisma.company.create({ data: dto });
    this.logger.log(`Company created: ${company.id}`);
    return company;
  }

  async findAll() {
    return this.prisma.company.findMany({
      include: { _count: { select: { technicians: true, workOrders: true } } },
    });
  }

  async findById(id: string) {
    return this.prisma.company.findUniqueOrThrow({ where: { id } });
  }

  async update(id: string, dto: UpdateCompanyDto) {
    return this.prisma.company.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    return this.prisma.company.delete({ where: { id } });
  }
}
