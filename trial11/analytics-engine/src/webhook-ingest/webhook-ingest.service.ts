import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { TenantService } from '../tenant/tenant.service.js';

export interface WebhookPayload {
  dataSourceId: string;
  timestamp?: string;
  dimensions: Record<string, unknown>;
  metrics: Record<string, unknown>;
}

@Injectable()
export class WebhookIngestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService,
  ) {}

  async ingest(apiKey: string, payload: WebhookPayload) {
    const tenant = await this.tenantService.findByApiKey(apiKey);
    if (!tenant) {
      throw new NotFoundException('Invalid API key');
    }

    // findFirst justified: verifying data source belongs to tenant (composite non-PK lookup)
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id: payload.dataSourceId, tenantId: tenant.id },
    });

    if (!dataSource) {
      throw new NotFoundException('Data source not found for this tenant');
    }

    try {
      const dataPoint = await this.prisma.dataPoint.create({
        data: {
          dataSourceId: payload.dataSourceId,
          tenantId: tenant.id,
          timestamp: payload.timestamp
            ? new Date(payload.timestamp)
            : new Date(),
          // type assertion justified: dimensions/metrics DTOs are Record<string, unknown>, Prisma expects InputJsonValue
          dimensions: payload.dimensions as Prisma.InputJsonValue,
          metrics: payload.metrics as Prisma.InputJsonValue,
        },
      });

      return dataPoint;
    } catch (err) {
      // type assertion justified: err from catch is unknown by default
      const error = err as Error;
      await this.prisma.deadLetterEvent.create({
        data: {
          dataSourceId: payload.dataSourceId,
          // type assertion justified: payload is WebhookPayload interface, Prisma expects InputJsonValue
          payload: payload as unknown as Prisma.InputJsonValue,
          errorReason: error.message,
        },
      });

      throw error;
    }
  }
}
