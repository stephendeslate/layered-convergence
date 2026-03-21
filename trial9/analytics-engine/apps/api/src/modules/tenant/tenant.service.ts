import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateTenantDto, UpdateTenantDto } from './tenant.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTenantDto) {
    const apiKey = `ak_${randomBytes(24).toString('hex')}`;
    const tenant = await this.prisma.tenant.create({
      data: { ...dto, apiKey },
    });
    this.logger.log(`Tenant created: ${tenant.id}`);
    return tenant;
  }

  async findAll() {
    return this.prisma.tenant.findMany({
      include: { _count: { select: { dashboards: true, dataSources: true } } },
    });
  }

  async findById(id: string) {
    return this.prisma.tenant.findUniqueOrThrow({ where: { id } });
  }

  async update(id: string, dto: UpdateTenantDto) {
    return this.prisma.tenant.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    return this.prisma.tenant.delete({ where: { id } });
  }

  async regenerateApiKey(id: string) {
    const apiKey = `ak_${randomBytes(24).toString('hex')}`;
    return this.prisma.tenant.update({ where: { id }, data: { apiKey } });
  }
}
