import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInvoiceDto) {
    const invoice = await this.prisma.invoice.create({
      data: {
        workOrderId: dto.workOrderId,
        amount: dto.amount,
        status: InvoiceStatus.DRAFT,
      },
    });

    // Also transition work order to INVOICED
    await this.prisma.workOrder.update({
      where: { id: dto.workOrderId },
      data: { status: 'INVOICED' },
    });

    return invoice;
  }

  async findByWorkOrder(workOrderId: string) {
    return this.prisma.invoice.findFirstOrThrow({
      where: { workOrderId },
      include: { workOrder: { include: { customer: true } } },
    });
  }

  async markPaid(id: string) {
    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.PAID },
    });

    await this.prisma.workOrder.update({
      where: { id: invoice.workOrderId },
      data: { status: 'PAID' },
    });

    return invoice;
  }
}
