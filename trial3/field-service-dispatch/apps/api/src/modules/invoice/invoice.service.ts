import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(workOrderId: string, companyId: string, lineItems: LineItem[]) {
    const workOrder = await this.prisma.workOrder.findFirstOrThrow({
      where: { id: workOrderId, companyId, status: 'COMPLETED' },
    });

    // Check for existing invoice — findFirst justified: existence check
    const existing = await this.prisma.invoice.findFirst({
      where: { workOrderId },
    });

    if (existing) {
      throw new BadRequestException('Invoice already exists for this work order');
    }

    const amount = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    const invoice = await this.prisma.invoice.create({
      data: {
        workOrderId: workOrder.id,
        companyId,
        amount: Math.round(amount),
        lineItems: lineItems as never,
      },
    });

    // Transition work order to INVOICED
    await this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: { status: 'INVOICED' },
    });

    await this.prisma.workOrderStatusHistory.create({
      data: {
        workOrderId,
        fromStatus: 'COMPLETED',
        toStatus: 'INVOICED',
        note: `Invoice created: $${(amount / 100).toFixed(2)}`,
      },
    });

    return invoice;
  }

  async findByIdAndCompany(id: string, companyId: string) {
    return this.prisma.invoice.findFirstOrThrow({
      where: { id, companyId },
      include: {
        workOrder: {
          include: { customer: true, technician: { select: { id: true, name: true } } },
        },
      },
    });
  }

  async findAllByCompany(companyId: string, filters?: { status?: string }) {
    return this.prisma.invoice.findMany({
      where: {
        companyId,
        ...(filters?.status ? { status: filters.status as never } : {}),
      },
      include: {
        workOrder: { include: { customer: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markSent(id: string, companyId: string) {
    await this.prisma.invoice.findFirstOrThrow({
      where: { id, companyId, status: 'DRAFT' },
    });

    return this.prisma.invoice.update({
      where: { id },
      data: { status: 'SENT' },
    });
  }

  async markPaid(id: string, companyId: string, stripePaymentIntentId?: string) {
    const invoice = await this.prisma.invoice.findFirstOrThrow({
      where: { id, companyId, status: 'SENT' },
    });

    const [updatedInvoice] = await this.prisma.$transaction([
      this.prisma.invoice.update({
        where: { id },
        data: {
          status: 'PAID',
          ...(stripePaymentIntentId ? { stripePaymentIntentId } : {}),
        },
      }),
      this.prisma.workOrder.update({
        where: { id: invoice.workOrderId },
        data: { status: 'PAID' },
      }),
      this.prisma.workOrderStatusHistory.create({
        data: {
          workOrderId: invoice.workOrderId,
          fromStatus: 'INVOICED',
          toStatus: 'PAID',
          note: 'Payment received',
        },
      }),
    ]);

    return updatedInvoice;
  }
}
