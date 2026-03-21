import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateInvoiceDto) {
    // Verify the work order belongs to this company and is completed
    const workOrder = await this.prisma.workOrder.findUniqueOrThrow({
      where: { id: dto.workOrderId, companyId },
    });

    if (workOrder.status !== 'completed') {
      throw new BadRequestException('Invoice can only be created for completed work orders');
    }

    const invoice = await this.prisma.invoice.create({
      data: {
        workOrderId: dto.workOrderId,
        amount: dto.amount,
        currency: dto.currency ?? 'usd',
      },
    });

    // Transition work order to invoiced
    await this.prisma.workOrder.update({
      where: { id: dto.workOrderId },
      data: { status: 'invoiced' },
    });

    await this.prisma.workOrderStatusHistory.create({
      data: {
        workOrderId: dto.workOrderId,
        fromStatus: 'completed',
        toStatus: 'invoiced',
        note: `Invoice ${invoice.id} created`,
      },
    });

    return invoice;
  }

  async findByWorkOrder(workOrderId: string) {
    return this.prisma.invoice.findUniqueOrThrow({
      where: { workOrderId },
    });
  }

  async findAllByCompany(companyId: string) {
    return this.prisma.invoice.findMany({
      where: { workOrder: { companyId } },
      include: { workOrder: { include: { customer: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markPaid(id: string) {
    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: { status: 'paid' },
    });

    await this.prisma.workOrder.update({
      where: { id: invoice.workOrderId },
      data: { status: 'paid' },
    });

    await this.prisma.workOrderStatusHistory.create({
      data: {
        workOrderId: invoice.workOrderId,
        fromStatus: 'invoiced',
        toStatus: 'paid',
        note: `Invoice ${id} paid`,
      },
    });

    return invoice;
  }
}
