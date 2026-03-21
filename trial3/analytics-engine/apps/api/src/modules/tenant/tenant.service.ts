import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { name: string; primaryColor?: string; fontFamily?: string; logoUrl?: string }) {
    return this.prisma.tenant.create({ data });
  }

  async findById(id: string) {
    return this.prisma.tenant.findFirstOrThrow({
      where: { id },
    });
  }

  async findByApiKey(apiKey: string) {
    return this.prisma.tenant.findFirstOrThrow({
      where: { apiKey },
    });
  }

  async update(id: string, data: { name?: string; primaryColor?: string; fontFamily?: string; logoUrl?: string }) {
    // Verify tenant exists first (throws 404 if not found)
    await this.prisma.tenant.findFirstOrThrow({ where: { id } });
    return this.prisma.tenant.update({ where: { id }, data });
  }

  async regenerateApiKey(id: string) {
    await this.prisma.tenant.findFirstOrThrow({ where: { id } });
    return this.prisma.tenant.update({
      where: { id },
      data: { apiKey: crypto.randomUUID() },
    });
  }

  async findAll() {
    return this.prisma.tenant.findMany();
  }
}
