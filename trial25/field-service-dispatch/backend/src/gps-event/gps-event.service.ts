// [TRACED:API-009] GPS event recording with Float coordinates
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant/tenant-context.service';

@Injectable()
export class GpsEventService {
  private readonly logger = new Logger(GpsEventService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async findByRoute(routeId: string, userId: string) {
    await this.tenantContext.setTenantContext(userId);
    return this.prisma.gpsEvent.findMany({
      where: { routeId },
      orderBy: { recordedAt: 'desc' },
    });
  }

  async findByTechnician(technicianId: string, userId: string) {
    await this.tenantContext.setTenantContext(userId);
    return this.prisma.gpsEvent.findMany({
      where: { technicianId },
      orderBy: { recordedAt: 'desc' },
      take: 100,
    });
  }

  async record(
    data: {
      latitude: number;
      longitude: number;
      technicianId: string;
      routeId?: string;
    },
    userId: string,
  ) {
    await this.tenantContext.setTenantContext(userId);
    const event = await this.prisma.gpsEvent.create({
      data: {
        ...data,
        recordedAt: new Date(),
      },
    });

    this.logger.log(`GPS event recorded: ${event.id}`);
    return event;
  }
}
