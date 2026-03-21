import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTenantDto } from './dto/create-tenant.dto.js';
import { UpdateTenantDto } from './dto/update-tenant.dto.js';

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTenantDto) {
    return this.prisma.tenant.create({
      data: {
        ...dto,
        apiKey: randomUUID(),
      },
    });
  }

  async findById(id: string) {
    return this.prisma.tenant.findUniqueOrThrow({
      where: { id },
    });
  }

  async update(id: string, dto: UpdateTenantDto) {
    return this.prisma.tenant.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.tenant.delete({
      where: { id },
    });
  }

  async findByApiKey(apiKey: string) {
    // findFirst justified: apiKey is unique, but we query by a non-PK field
    return this.prisma.tenant.findFirst({
      where: { apiKey },
    });
  }
}
