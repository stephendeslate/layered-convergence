import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { InvoiceStatus, WorkOrderStatus } from '@prisma/client';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInvoiceDto) {
    const workOrder = await this.prisma.workOrder.findFirstOrThrow({
      where: { id: dto.workOrderId },
    });

    if (workOrder.status !== WorkOrderStatus.COMPLETED) {
      throw new BadRequestException(
        'Invoices can only be created for completed work orders',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          workOrderId: dto.workOrderId,
          amount: dto.amount,
          status: InvoiceStatus.DRAFT,
        },
      });

      await tx.workOrder.update({
        where: { id: dto.workOrderId },
        data: { status: WorkOrderStatus.INVOICED },
      });

      await tx.workOrderStatusHistory.create({
        data: {
          workOrderId: dto.workOrderId,
          fromStatus: WorkOrderStatus.COMPLETED,
          toStatus: WorkOrderStatus.INVOICED,
          note: `Invoice created: ${invoice.id}`,
        },
      });

      return invoice;
    });
  }

  async findAll(companyId: string) {
    return this.prisma.invoice.findMany({
      where: { workOrder: { companyId } },
      include: { workOrder: { include: { customer: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneOrThrow(id: string) {
    return this.prisma.invoice.findFirstOrThrow({
      where: { id },
      include: { workOrder: { include: { customer: true, technician: true } } },
    });
  }

  async markPaid(id: string, stripePaymentIntentId: string) {
    const invoice = await this.prisma.invoice.findFirstOrThrow({
      where: { id },
    });

    if (invoice.status !== InvoiceStatus.SENT && invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Invoice must be in DRAFT or SENT status to mark as paid');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.invoice.update({
        where: { id },
        data: {
          status: InvoiceStatus.PAID,
          stripePaymentIntentId,
        },
      });

      await tx.workOrder.update({
        where: { id: invoice.workOrderId },
        data: { status: WorkOrderStatus.PAID },
      });

      await tx.workOrderStatusHistory.create({
        data: {
          workOrderId: invoice.workOrderId,
          fromStatus: WorkOrderStatus.INVOICED,
          toStatus: WorkOrderStatus.PAID,
          note: `Payment received: ${stripePaymentIntentId}`,
        },
      });

      return updated;
    });
  }
}
