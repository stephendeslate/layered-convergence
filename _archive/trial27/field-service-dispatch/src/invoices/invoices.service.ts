import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InvoiceStatus, WorkOrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateInvoiceDto) {
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: dto.workOrderId, companyId },
    });

    if (!workOrder) {
      throw new NotFoundException(
        `Work order ${dto.workOrderId} not found`,
      );
    }

    if (workOrder.status !== WorkOrderStatus.COMPLETED) {
      throw new BadRequestException(
        'Can only create invoices for completed work orders',
      );
    }

    const invoice = await this.prisma.invoice.create({
      data: {
        workOrderId: dto.workOrderId,
        amount: dto.amount,
        status: InvoiceStatus.DRAFT,
      },
      include: { workOrder: true },
    });

    await this.prisma.workOrder.update({
      where: { id: dto.workOrderId },
      data: { status: WorkOrderStatus.INVOICED },
    });

    await this.prisma.workOrderStatusHistory.create({
      data: {
        workOrderId: dto.workOrderId,
        fromStatus: WorkOrderStatus.COMPLETED,
        toStatus: WorkOrderStatus.INVOICED,
        note: `Invoice created: $${dto.amount}`,
      },
    });

    return invoice;
  }

  async findAll(companyId: string) {
    return this.prisma.invoice.findMany({
      where: { workOrder: { companyId } },
      include: {
        workOrder: { include: { customer: true, technician: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        workOrder: { include: { customer: true, technician: true } },
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${id} not found`);
    }

    return invoice;
  }

  async markAsSent(id: string) {
    const invoice = await this.findOne(id);
    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Can only send draft invoices');
    }
    return this.prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.SENT },
    });
  }

  async markAsPaid(id: string, stripePaymentIntentId?: string) {
    const invoice = await this.findOne(id);
    if (
      invoice.status !== InvoiceStatus.SENT &&
      invoice.status !== InvoiceStatus.DRAFT
    ) {
      throw new BadRequestException('Can only pay sent or draft invoices');
    }

    const [updatedInvoice] = await this.prisma.$transaction([
      this.prisma.invoice.update({
        where: { id },
        data: {
          status: InvoiceStatus.PAID,
          stripePaymentIntentId,
        },
      }),
      this.prisma.workOrder.update({
        where: { id: invoice.workOrderId },
        data: { status: WorkOrderStatus.PAID },
      }),
      this.prisma.workOrderStatusHistory.create({
        data: {
          workOrderId: invoice.workOrderId,
          fromStatus: WorkOrderStatus.INVOICED,
          toStatus: WorkOrderStatus.PAID,
          note: 'Payment received',
        },
      }),
    ]);

    return updatedInvoice;
  }

  async voidInvoice(id: string) {
    const invoice = await this.findOne(id);
    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot void a paid invoice');
    }
    return this.prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.VOID },
    });
  }
}
