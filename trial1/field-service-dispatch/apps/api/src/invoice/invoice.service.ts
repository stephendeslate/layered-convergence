import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

export interface InvoiceListQuery {
  page?: number;
  pageSize?: number;
  status?: string;
  customerId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Generate an invoice from a completed work order's line items.
   */
  async generate(companyId: string, workOrderId: string, userId?: string) {
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId, companyId },
      include: { lineItems: true, invoice: true },
    });

    if (!workOrder) {
      throw new NotFoundException(`Work order ${workOrderId} not found`);
    }

    if (workOrder.invoice) {
      throw new BadRequestException('Invoice already exists for this work order');
    }

    if (workOrder.lineItems.length === 0) {
      throw new BadRequestException('Cannot generate invoice without line items');
    }

    // Calculate totals
    const subtotal = workOrder.lineItems.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0,
    );

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { taxRate: true },
    });
    const taxRate = Number(company?.taxRate ?? 0);
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;

    const invoiceNumber = await this.generateInvoiceNumber(companyId);

    const invoice = await this.prisma.invoice.create({
      data: {
        companyId,
        customerId: workOrder.customerId,
        workOrderId,
        invoiceNumber,
        status: 'DRAFT',
        subtotal,
        taxAmount,
        totalAmount,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        lineItems: {
          connect: workOrder.lineItems.map((item) => ({ id: item.id })),
        },
      },
      include: {
        lineItems: { orderBy: { sortOrder: 'asc' } },
        customer: true,
        workOrder: true,
      },
    });

    await this.audit.log({
      companyId,
      userId,
      action: 'invoice.generate',
      entityType: 'Invoice',
      entityId: invoice.id,
      metadata: { invoiceNumber, totalAmount, workOrderId },
    });

    return invoice;
  }

  /**
   * Get an invoice by ID.
   */
  async get(companyId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, companyId },
      include: {
        lineItems: { orderBy: { sortOrder: 'asc' } },
        customer: true,
        workOrder: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceId} not found`);
    }

    return invoice;
  }

  /**
   * List invoices with filters and pagination.
   */
  async list(companyId: string, query: InvoiceListQuery) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    if (query.status) where.status = query.status;
    if (query.customerId) where.customerId = query.customerId;

    const orderBy: any = {};
    orderBy[query.sortBy ?? 'createdAt'] = query.sortOrder ?? 'desc';

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: {
          customer: true,
          lineItems: true,
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Mark an invoice as paid.
   */
  async markPaid(
    companyId: string,
    invoiceId: string,
    paymentInfo?: { stripePaymentIntentId?: string },
    userId?: string,
  ) {
    const invoice = await this.getOrThrow(companyId, invoiceId);

    if (invoice.status === 'PAID') {
      throw new BadRequestException('Invoice is already paid');
    }

    const updated = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
      include: {
        lineItems: true,
        customer: true,
      },
    });

    await this.audit.log({
      companyId,
      userId,
      action: 'invoice.mark_paid',
      entityType: 'Invoice',
      entityId: invoiceId,
      metadata: paymentInfo,
    });

    return updated;
  }

  /**
   * Update a draft invoice.
   */
  async update(
    companyId: string,
    invoiceId: string,
    dto: { notes?: string; dueDate?: string },
    userId?: string,
  ) {
    const invoice = await this.getOrThrow(companyId, invoiceId);

    if (invoice.status !== 'DRAFT') {
      throw new BadRequestException('Only draft invoices can be edited');
    }

    const data: any = {};
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.dueDate) data.dueDate = new Date(dto.dueDate);

    const updated = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data,
      include: {
        lineItems: true,
        customer: true,
      },
    });

    await this.audit.log({
      companyId,
      userId,
      action: 'invoice.update',
      entityType: 'Invoice',
      entityId: invoiceId,
      metadata: { updatedFields: Object.keys(dto) },
    });

    return updated;
  }

  private async getOrThrow(companyId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, companyId },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceId} not found`);
    }

    return invoice;
  }

  private async generateInvoiceNumber(companyId: string): Promise<string> {
    const count = await this.prisma.invoice.count({
      where: { companyId },
    });
    return `INV-${String(count + 1).padStart(5, '0')}`;
  }
}
