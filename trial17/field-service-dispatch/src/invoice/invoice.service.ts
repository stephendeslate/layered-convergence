import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateInvoiceDto) {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id: dto.workOrderId },
    });

    if (!workOrder || workOrder.companyId !== companyId) {
      throw new NotFoundException('Work order not found');
    }

    if (workOrder.status !== 'COMPLETED' && workOrder.status !== 'INVOICED') {
      throw new BadRequestException('Work order must be completed before invoicing');
    }

    const amount = new Decimal(dto.amount);
    const tax = new Decimal(dto.tax ?? 0);
    const total = amount.add(tax);

    const count = await this.prisma.invoice.count({ where: { companyId } });
    const number = `INV-${String(count + 1).padStart(5, '0')}`;

    const invoice = await this.prisma.invoice.create({
      data: {
        number,
        amount,
        tax,
        total,
        notes: dto.notes,
        companyId,
        workOrderId: dto.workOrderId,
      },
      include: { workOrder: true },
    });

    await this.prisma.workOrder.update({
      where: { id: dto.workOrderId },
      data: { status: 'INVOICED' },
    });

    return invoice;
  }

  async findAll(companyId: string) {
    return this.prisma.invoice.findMany({
      where: { companyId },
      include: { workOrder: true },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { workOrder: true },
    });

    if (!invoice || invoice.companyId !== companyId) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async markPaid(companyId: string, id: string) {
    const invoice = await this.findOne(companyId, id);

    return this.prisma.invoice.update({
      where: { id: invoice.id },
      data: { paidAt: new Date() },
      include: { workOrder: true },
    });
  }
}
