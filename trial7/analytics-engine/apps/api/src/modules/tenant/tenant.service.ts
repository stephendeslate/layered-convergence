import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { toJsonField } from '../../common/helpers/json-field.helper';
import { randomBytes } from 'crypto';

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTenantDto) {
    const apiKey = `ak_${randomBytes(24).toString('hex')}`;
    return this.prisma.tenant.create({
      data: {
        name: dto.name,
        apiKey,
        branding: dto.branding ? toJsonField(dto.branding) : undefined,
      },
    });
  }

  async findAll() {
    return this.prisma.tenant.findMany({
      include: { dashboards: true, dataSources: true },
    });
  }

  async findOneOrThrow(id: string) {
    return this.prisma.tenant.findFirstOrThrow({
      where: { id },
      include: { dashboards: true, dataSources: true },
    });
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.prisma.tenant.findFirstOrThrow({ where: { id } });
    return this.prisma.tenant.update({
      where: { id },
      data: {
        name: dto.name,
        branding: dto.branding ? toJsonField(dto.branding) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.prisma.tenant.findFirstOrThrow({ where: { id } });
    return this.prisma.tenant.delete({ where: { id } });
  }

  async regenerateApiKey(id: string) {
    await this.prisma.tenant.findFirstOrThrow({ where: { id } });
    const apiKey = `ak_${randomBytes(24).toString('hex')}`;
    return this.prisma.tenant.update({
      where: { id },
      data: { apiKey },
    });
  }
}
