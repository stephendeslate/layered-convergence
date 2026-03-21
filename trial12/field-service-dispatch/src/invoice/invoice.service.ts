import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { WorkOrderStatus, InvoiceStatus } from '../../generated/prisma/client.js';
import { CreateInvoiceDto } from './dto/create-invoice.dto.js';

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateInvoiceDto) {
    const workOrder = await this.prisma.workOrder.findFirstOrThrow({
      where: { id: dto.workOrderId, companyId },
    });

    if (workOrder.status !== WorkOrderStatus.COMPLETED) {
      throw new BadRequestException('Work order must be COMPLETED to create invoice');
    }

    const [invoice] = await this.prisma.$transaction([
      this.prisma.invoice.create({
        data: {
          workOrderId: dto.workOrderId,
          amount: dto.amount,
        },
      }),
      this.prisma.workOrder.update({
        where: { id: dto.workOrderId },
        data: { status: WorkOrderStatus.INVOICED },
      }),
      this.prisma.workOrderStatusHistory.create({
        data: {
          workOrderId: dto.workOrderId,
          fromStatus: WorkOrderStatus.COMPLETED,
          toStatus: WorkOrderStatus.INVOICED,
          note: 'Invoice created',
        },
      }),
    ]);

    return invoice;
  }

  async markPaid(companyId: string, id: string) {
    const invoice = await this.prisma.invoice.findUniqueOrThrow({
      where: { id },
      include: { workOrder: true },
    });

    if (invoice.workOrder.companyId !== companyId) {
      throw new BadRequestException('Invoice does not belong to this company');
    }

    if (invoice.status !== InvoiceStatus.DRAFT && invoice.status !== InvoiceStatus.SENT) {
      throw new BadRequestException('Invoice must be DRAFT or SENT to mark as paid');
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.invoice.update({
        where: { id },
        data: { status: InvoiceStatus.PAID },
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
          note: 'Invoice paid',
        },
      }),
    ]);

    return updated;
  }

  findAll(companyId: string) {
    return this.prisma.invoice.findMany({
      where: { workOrder: { companyId } },
      include: { workOrder: true },
    });
  }

  findOne(id: string) {
    return this.prisma.invoice.findUniqueOrThrow({
      where: { id },
      include: { workOrder: true },
    });
  }
}
