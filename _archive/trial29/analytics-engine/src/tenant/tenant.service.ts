import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTenantDto } from './dto/create-tenant.dto.js';
import { UpdateTenantDto } from './dto/update-tenant.dto.js';
import { randomUUID } from 'crypto';

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTenantDto) {
    const apiKey = `ak_${randomUUID().replace(/-/g, '')}`;
    return this.prisma.tenant.create({
      data: {
        ...dto,
        apiKey,
      },
    });
  }

  async findAll() {
    return this.prisma.tenant.findMany();
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  async findByApiKey(apiKey: string) {
    // findFirst: apiKey is unique — at most one result
    const tenant = await this.prisma.tenant.findFirst({
      where: { apiKey },
    });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.findOne(id);
    return this.prisma.tenant.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.tenant.delete({ where: { id } });
  }

  async regenerateApiKey(id: string) {
    await this.findOne(id);
    const apiKey = `ak_${randomUUID().replace(/-/g, '')}`;
    return this.prisma.tenant.update({
      where: { id },
      data: { apiKey },
    });
  }
}
