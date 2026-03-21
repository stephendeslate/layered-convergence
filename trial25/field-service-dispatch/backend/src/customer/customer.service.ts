// [TRACED:API-008] Customer CRUD with company-scoped access
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant/tenant-context.service';

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async findAll(userId: string, companyId: string) {
    await this.tenantContext.setTenantContext(userId);
    return this.prisma.customer.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, userId: string, companyId: string) {
    await this.tenantContext.setTenantContext(userId);
    // findFirst used because we filter by both id and companyId for tenant isolation
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId },
      include: { workOrders: true, invoices: true },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async create(
    data: { name: string; email: string; phone?: string; address: string },
    userId: string,
    companyId: string,
  ) {
    await this.tenantContext.setTenantContext(userId);
    const customer = await this.prisma.customer.create({
      data: { ...data, companyId },
    });

    this.logger.log(`Customer created: ${customer.id}`);
    return customer;
  }
}
