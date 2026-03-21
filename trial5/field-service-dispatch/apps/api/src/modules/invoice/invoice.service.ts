import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkOrderStatus, InvoiceStatus } from '@prisma/client';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInvoiceDto) {
    const workOrder = await this.prisma.workOrder.findUniqueOrThrow({
      where: { id: dto.workOrderId },
    });

    if (workOrder.status !== WorkOrderStatus.COMPLETED) {
      throw new BadRequestException('Can only invoice completed work orders');
    }

    const invoice = await this.prisma.invoice.create({
      data: {
        workOrderId: dto.workOrderId,
        amount: dto.amount,
        currency: dto.currency ?? 'usd',
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });

    // Side effect: transition work order to INVOICED
    await this.prisma.workOrder.update({
      where: { id: dto.workOrderId },
      data: { status: WorkOrderStatus.INVOICED },
    });

    await this.prisma.workOrderStatusHistory.create({
      data: {
        workOrderId: dto.workOrderId,
        fromStatus: WorkOrderStatus.COMPLETED,
        toStatus: WorkOrderStatus.INVOICED,
        note: `Invoice created: $${dto.amount / 100}`,
      },
    });

    this.logger.log(`Invoice created for work order ${dto.workOrderId}: $${dto.amount / 100}`);

    return invoice;
  }

  async markPaid(id: string) {
    const invoice = await this.prisma.invoice.findUniqueOrThrow({
      where: { id },
    });

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.PAID,
        paidAt: new Date(),
      },
    });

    // Side effect: transition work order to PAID
    await this.prisma.workOrder.update({
      where: { id: invoice.workOrderId },
      data: { status: WorkOrderStatus.PAID },
    });

    await this.prisma.workOrderStatusHistory.create({
      data: {
        workOrderId: invoice.workOrderId,
        fromStatus: WorkOrderStatus.INVOICED,
        toStatus: WorkOrderStatus.PAID,
        note: 'Payment received',
      },
    });

    return updated;
  }

  async findByWorkOrder(workOrderId: string) {
    return this.prisma.invoice.findUniqueOrThrow({
      where: { workOrderId },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.invoice.findMany({
      where: { workOrder: { companyId } },
      include: { workOrder: { include: { customer: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.invoice.findUniqueOrThrow({
      where: { id },
      include: { workOrder: { include: { customer: true, technician: true } } },
    });
  }
}
