import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTenantDto) {
    const apiKey = `ak_${randomBytes(24).toString('hex')}`;
    return this.prisma.tenant.create({
      data: { ...dto, apiKey },
    });
  }

  async findAll() {
    return this.prisma.tenant.findMany({
      include: { dashboards: true, dataSources: true },
    });
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUniqueOrThrow({
      where: { id },
      include: { dashboards: true, dataSources: true },
    });
    return tenant;
  }

  async update(id: string, dto: UpdateTenantDto) {
    return this.prisma.tenant.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.tenant.delete({ where: { id } });
  }

  async regenerateApiKey(id: string) {
    const apiKey = `ak_${randomBytes(24).toString('hex')}`;
    return this.prisma.tenant.update({
      where: { id },
      data: { apiKey },
    });
  }
}
