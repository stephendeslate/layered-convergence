import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTenantDto, UpdateTenantDto } from './tenant.dto';

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTenantDto) {
    const apiKey = `ak_${crypto.randomUUID().replace(/-/g, '')}`;
    return this.prisma.tenant.create({
      data: {
        name: dto.name,
        apiKey,
        primaryColor: dto.primaryColor ?? '#3B82F6',
        fontFamily: dto.fontFamily ?? 'Inter',
        logoUrl: dto.logoUrl,
      },
    });
  }

  async findAll() {
    return this.prisma.tenant.findMany({
      include: { dashboards: true, dataSources: true },
    });
  }

  async findById(id: string) {
    return this.prisma.tenant.findFirstOrThrow({
      where: { id },
      include: { dashboards: true, dataSources: true },
    });
  }

  async findByApiKey(apiKey: string) {
    return this.prisma.tenant.findFirstOrThrow({
      where: { apiKey },
    });
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.prisma.tenant.findFirstOrThrow({ where: { id } });
    return this.prisma.tenant.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    await this.prisma.tenant.findFirstOrThrow({ where: { id } });
    return this.prisma.tenant.delete({ where: { id } });
  }
}
