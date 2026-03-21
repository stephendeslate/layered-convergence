import {
  Controller,
  Get,
  Param,
  UseGuards,
  Req,
  Res,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiKeyAuthGuard } from '../auth/api-key-auth.guard';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { SseService } from './sse.service';
import { EmbedService } from '../embed/embed.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * SSE endpoint for real-time dashboard updates.
 * Per SRS-4 section 4.2: GET /api/sse/:dashboardId
 */
@Controller('api/sse')
@UseGuards(ApiKeyAuthGuard)
export class SseController {
  constructor(
    private readonly sseService: SseService,
    private readonly embedService: EmbedService,
    private readonly prisma: PrismaService,
  ) {}

  @Get(':dashboardId')
  async subscribe(
    @Param('dashboardId') dashboardId: string,
    @Req() req: Request,
    @Res() res: Response,
    @CurrentTenant() tenantId: string,
  ) {
    // 1. Verify dashboard exists and is published
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id: dashboardId, tenantId, status: 'PUBLISHED' },
      include: { embedConfig: true },
    });

    if (!dashboard) {
      throw new NotFoundException('Published dashboard not found');
    }

    if (!dashboard.embedConfig) {
      throw new NotFoundException('Embed config not found for dashboard');
    }

    // 2. Validate origin
    const origin = req.headers.origin as string | undefined;
    const isValidOrigin = this.embedService.validateOrigin(
      dashboard.embedConfig.id,
      origin,
      dashboard.embedConfig.allowedOrigins,
    );

    if (!isValidOrigin) {
      throw new ForbiddenException('Origin not allowed');
    }

    // 3. Subscribe to SSE events
    this.sseService.subscribe(dashboardId, tenantId, res);
  }
}
