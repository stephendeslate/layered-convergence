import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateEmbedConfigDto, UpdateEmbedConfigDto } from './embed-config.dto';

@Injectable()
export class EmbedConfigService {
  private readonly logger = new Logger(EmbedConfigService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEmbedConfigDto) {
    const config = await this.prisma.embedConfig.create({
      data: {
        dashboardId: dto.dashboardId,
        allowedOrigins: dto.allowedOrigins ?? [],
        themeOverrides: dto.themeOverrides ?? {},
      },
    });
    this.logger.log(`Embed config created for dashboard ${dto.dashboardId}`);
    return config;
  }

  async findByDashboard(dashboardId: string) {
    // findFirst justified: dashboardId has a @unique constraint, but we query by
    // a field that is unique — using findFirst for flexibility in case the embed
    // config doesn't exist yet (returns null instead of throwing).
    return this.prisma.embedConfig.findFirst({
      where: { dashboardId },
    });
  }

  async update(id: string, dto: UpdateEmbedConfigDto) {
    return this.prisma.embedConfig.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    return this.prisma.embedConfig.delete({ where: { id } });
  }

  /**
   * Resolve embed config for rendering. Returns dashboard + tenant branding + embed overrides.
   */
  async resolveForEmbed(dashboardId: string) {
    const embedConfig = await this.prisma.embedConfig.findUniqueOrThrow({
      where: { dashboardId },
      include: {
        dashboard: {
          include: {
            tenant: true,
            widgets: { orderBy: [{ positionY: 'asc' }, { positionX: 'asc' }] },
          },
        },
      },
    });
    return embedConfig;
  }
}
