// [TRACED:SA-003] Invoice state machine: DRAFT -> SENT -> PAID | OVERDUE
// [TRACED:API-007] Invoice CRUD with company-scoped access
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant/tenant-context.service';
import { InvoiceStatus } from '@prisma/client';

const validTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
  DRAFT: [InvoiceStatus.SENT],
  SENT: [InvoiceStatus.PAID, InvoiceStatus.OVERDUE],
  PAID: [],
  OVERDUE: [InvoiceStatus.PAID],
};

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async findAll(userId: string, companyId: string) {
    await this.tenantContext.setTenantContext(userId);
    return this.prisma.invoice.findMany({
      where: { companyId },
      include: { customer: true, workOrder: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, companyId: string) {
    await this.tenantContext.setTenantContext(userId);
    // findFirst used because we filter by both id and companyId for tenant isolation
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
      include: { customer: true, workOrder: true },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async create(
    data: {
      amount: number;
      taxAmount: number;
      totalAmount: number;
      dueDate?: Date;
      customerId: string;
      workOrderId: string;
    },
    userId: string,
    companyId: string,
  ) {
    await this.tenantContext.setTenantContext(userId);
    const invoice = await this.prisma.invoice.create({
      data: { ...data, companyId },
    });

    this.logger.log(`Invoice created: ${invoice.id}`);
    return invoice;
  }

  async updateStatus(
    id: string,
    newStatus: InvoiceStatus,
    userId: string,
    companyId: string,
  ) {
    const invoice = await this.findOne(id, userId, companyId);
    const allowed = validTransitions[invoice.status];

    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${invoice.status} to ${newStatus}`,
      );
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        status: newStatus,
        paidAt: newStatus === InvoiceStatus.PAID ? new Date() : undefined,
      },
    });

    this.logger.log(
      `Invoice ${id} transitioned: ${invoice.status} -> ${newStatus}`,
    );
    return updated;
  }
}
