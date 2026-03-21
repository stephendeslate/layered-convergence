import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmbedConfigDto } from './dto/create-embed-config.dto';
import { UpdateEmbedConfigDto } from './dto/update-embed-config.dto';

@Injectable()
export class EmbedService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateEmbedConfigDto) {
    return this.prisma.embedConfig.create({
      data: {
        dashboardId: dto.dashboardId,
        allowedOrigins: dto.allowedOrigins ?? [],
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.embedConfig.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    // findFirst: justified because we filter by both id and tenantId for tenant isolation
    const config = await this.prisma.embedConfig.findFirst({
      where: { id, tenantId },
    });

    if (!config) {
      throw new NotFoundException(`EmbedConfig with id ${id} not found`);
    }

    return config;
  }

  async findByToken(token: string) {
    // findFirst: justified because token is unique but we use findFirst for consistent error handling
    const config = await this.prisma.embedConfig.findFirst({
      where: { token },
    });

    if (!config) {
      throw new NotFoundException('Invalid embed token');
    }

    if (config.expiresAt && config.expiresAt < new Date()) {
      throw new NotFoundException('Embed token has expired');
    }

    return config;
  }

  async update(tenantId: string, id: string, dto: UpdateEmbedConfigDto) {
    await this.findOne(tenantId, id);

    const data: Record<string, unknown> = {};
    if (dto.allowedOrigins !== undefined) data['allowedOrigins'] = dto.allowedOrigins;
    if (dto.expiresAt !== undefined) data['expiresAt'] = new Date(dto.expiresAt);

    return this.prisma.embedConfig.update({
      where: { id },
      data,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.embedConfig.delete({ where: { id } });
  }
}
