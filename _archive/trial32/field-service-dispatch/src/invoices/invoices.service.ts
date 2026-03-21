import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInvoiceDto) {
    return this.prisma.invoice.create({
      data: {
        workOrderId: dto.workOrderId,
        amount: dto.amount,
        status: dto.status || 'DRAFT',
      },
      include: { workOrder: true },
    });
  }

  async findAll() {
    return this.prisma.invoice.findMany({
      include: { workOrder: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { workOrder: true },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice ${id} not found`);
    }
    return invoice;
  }

  async findByWorkOrder(workOrderId: string) {
    return this.prisma.invoice.findUnique({
      where: { workOrderId },
      include: { workOrder: true },
    });
  }

  async markPaid(id: string, stripePaymentIntentId?: string) {
    await this.findOne(id);
    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: 'PAID',
        stripePaymentIntentId,
      },
      include: { workOrder: true },
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.invoice.delete({ where: { id } });
  }
}
