import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTenantDto) {
    return this.prisma.tenant.create({
      data: {
        ...dto,
        apiKey: uuidv4(),
      },
    });
  }

  async findAll() {
    return this.prisma.tenant.findMany();
  }

  async findOne(id: string) {
    return this.prisma.tenant.findUniqueOrThrow({ where: { id } });
  }

  async findByApiKey(apiKey: string) {
    return this.prisma.tenant.findUnique({ where: { apiKey } });
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
    return this.prisma.tenant.update({
      where: { id },
      data: { apiKey: uuidv4() },
    });
  }
}
