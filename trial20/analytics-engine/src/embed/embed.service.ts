import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant-context/tenant-context.service';
import { CreateEmbedDto } from './dto/create-embed.dto';

@Injectable()
export class EmbedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async findAll(tenantId: string) {
    await this.tenantContext.setContext(tenantId);
    return this.prisma.embed.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByToken(token: string) {
    // findUnique for unique constraint lookup (token has @unique)
    const embed = await this.prisma.embed.findUnique({
      where: { token },
    });
    if (!embed) {
      throw new NotFoundException('Embed not found');
    }
    if (new Date() > embed.expiresAt) {
      throw new NotFoundException('Embed has expired');
    }
    return embed;
  }

  async create(dto: CreateEmbedDto, tenantId: string) {
    await this.tenantContext.setContext(tenantId);
    return this.prisma.embed.create({
      data: {
        dashboardId: dto.dashboardId,
        tenantId,
        expiresAt: new Date(dto.expiresAt),
      },
    });
  }

  async delete(id: string, tenantId: string) {
    await this.tenantContext.setContext(tenantId);
    // findUnique for primary key lookup
    const embed = await this.prisma.embed.findUnique({
      where: { id },
    });
    if (!embed || embed.tenantId !== tenantId) {
      throw new NotFoundException('Embed not found');
    }
    return this.prisma.embed.delete({ where: { id } });
  }
}
