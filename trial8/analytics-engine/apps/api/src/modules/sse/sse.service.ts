import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SseService {
  private readonly logger = new Logger(SseService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get current dashboard data for SSE streaming.
   * Returns the latest widget data for the given dashboard.
   */
  async getDashboardUpdate(dashboardId: string) {
    this.logger.debug(`SSE update for dashboard ${dashboardId}`);

    const dashboard = await this.prisma.dashboard.findUniqueOrThrow({
      where: { id: dashboardId },
      include: { widgets: true },
    });

    return {
      dashboardId,
      updatedAt: new Date().toISOString(),
      widgetCount: dashboard.widgets.length,
    };
  }
}
