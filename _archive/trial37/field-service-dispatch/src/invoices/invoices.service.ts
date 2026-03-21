import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkOrderStatus, InvoiceStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateInvoiceDto) {
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: dto.workOrderId, companyId },
    });
    if (!workOrder) throw new NotFoundException('Work order not found');
    if (workOrder.status !== WorkOrderStatus.COMPLETED) {
      throw new BadRequestException('Work order must be completed before invoicing');
    }

    const invoice = await this.prisma.invoice.create({
      data: {
        workOrderId: dto.workOrderId,
        amount: dto.amount,
      },
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
        note: `Invoice created: ${invoice.id}`,
      },
    });

    return invoice;
  }

  async findAll(companyId: string) {
    return this.prisma.invoice.findMany({
      where: { workOrder: { companyId } },
      include: { workOrder: { include: { customer: true } } },
    });
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { workOrder: { include: { customer: true } } },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async markPaid(id: string, stripePaymentIntentId?: string) {
    const invoice = await this.findOne(id);
    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Invoice is already paid');
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.PAID,
        stripePaymentIntentId,
      },
    });

    await this.prisma.workOrder.update({
      where: { id: invoice.workOrderId },
      data: { status: WorkOrderStatus.PAID },
    });

    await this.prisma.workOrderStatusHistory.create({
      data: {
        workOrderId: invoice.workOrderId,
        fromStatus: WorkOrderStatus.INVOICED,
        toStatus: WorkOrderStatus.PAID,
        note: `Invoice ${id} paid`,
      },
    });

    return updated;
  }
}
