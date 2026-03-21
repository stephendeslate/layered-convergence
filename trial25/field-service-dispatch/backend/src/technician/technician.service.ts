// [TRACED:API-005] Technician CRUD with company-scoped access
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant/tenant-context.service';

@Injectable()
export class TechnicianService {
  private readonly logger = new Logger(TechnicianService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async findAll(userId: string, companyId: string) {
    await this.tenantContext.setTenantContext(userId);
    return this.prisma.technician.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, userId: string, companyId: string) {
    await this.tenantContext.setTenantContext(userId);
    // findFirst used because we filter by both id and companyId for tenant isolation
    const technician = await this.prisma.technician.findFirst({
      where: { id, companyId },
      include: { workOrders: true, routes: true },
    });

    if (!technician) {
      throw new NotFoundException('Technician not found');
    }

    return technician;
  }

  async create(
    data: { name: string; email: string; phone?: string; skills: string[] },
    userId: string,
    companyId: string,
  ) {
    await this.tenantContext.setTenantContext(userId);
    const technician = await this.prisma.technician.create({
      data: { ...data, companyId },
    });

    this.logger.log(`Technician created: ${technician.id}`);
    return technician;
  }
}
