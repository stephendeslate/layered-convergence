import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmbedDto, UpdateEmbedDto } from './embed.dto';

@Injectable()
export class EmbedService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.embed.findMany({
      where: { tenantId },
      include: { dashboard: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    // findFirst justified: filtering by tenantId + id for tenant isolation
    const embed = await this.prisma.embed.findFirst({
      where: { id, tenantId },
      include: { dashboard: true },
    });

    if (!embed) {
      throw new NotFoundException('Embed not found');
    }

    return embed;
  }

  async findByToken(token: string) {
    // findFirst justified: looking up by unique token for public embed access
    const embed = await this.prisma.embed.findFirst({
      where: { token, isActive: true },
      include: { dashboard: { include: { widgets: true } } },
    });

    if (!embed) {
      throw new NotFoundException('Embed not found or inactive');
    }

    if (embed.expiresAt && embed.expiresAt < new Date()) {
      throw new NotFoundException('Embed has expired');
    }

    return embed;
  }

  async create(tenantId: string, dto: CreateEmbedDto) {
    return this.prisma.embed.create({
      data: {
        tenantId,
        dashboardId: dto.dashboardId,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        allowedOrigins: dto.allowedOrigins ?? [],
      },
      include: { dashboard: true },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateEmbedDto) {
    await this.findOne(tenantId, id);

    return this.prisma.embed.update({
      where: { id },
      data: {
        isActive: dto.isActive,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        allowedOrigins: dto.allowedOrigins,
      },
      include: { dashboard: true },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.embed.delete({
      where: { id },
    });
  }
}
