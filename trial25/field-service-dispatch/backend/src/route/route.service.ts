// [TRACED:SA-004] Route state machine: PLANNED -> IN_PROGRESS -> COMPLETED
// [TRACED:API-006] Route CRUD with company-scoped access
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant/tenant-context.service';
import { RouteStatus } from '@prisma/client';

const validTransitions: Record<RouteStatus, RouteStatus[]> = {
  PLANNED: [RouteStatus.IN_PROGRESS],
  IN_PROGRESS: [RouteStatus.COMPLETED],
  COMPLETED: [],
};

@Injectable()
export class RouteService {
  private readonly logger = new Logger(RouteService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async findAll(userId: string, companyId: string) {
    await this.tenantContext.setTenantContext(userId);
    return this.prisma.route.findMany({
      where: { companyId },
      include: { technician: true },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, companyId: string) {
    await this.tenantContext.setTenantContext(userId);
    // findFirst used because we filter by both id and companyId for tenant isolation
    const route = await this.prisma.route.findFirst({
      where: { id, companyId },
      include: { technician: true, gpsEvents: true },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    return route;
  }

  async create(
    data: { name: string; scheduledAt: Date; technicianId: string },
    userId: string,
    companyId: string,
  ) {
    await this.tenantContext.setTenantContext(userId);
    const route = await this.prisma.route.create({
      data: { ...data, companyId },
    });

    this.logger.log(`Route created: ${route.id}`);
    return route;
  }

  async updateStatus(
    id: string,
    newStatus: RouteStatus,
    userId: string,
    companyId: string,
  ) {
    const route = await this.findOne(id, userId, companyId);
    const allowed = validTransitions[route.status];

    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${route.status} to ${newStatus}`,
      );
    }

    const updated = await this.prisma.route.update({
      where: { id },
      data: { status: newStatus },
    });

    this.logger.log(
      `Route ${id} transitioned: ${route.status} -> ${newStatus}`,
    );
    return updated;
  }
}
