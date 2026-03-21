import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
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
    return this.prisma.tenant.findFirstOrThrow({
      where: { id },
      include: { dashboards: true, dataSources: true },
    });
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
}
