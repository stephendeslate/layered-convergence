import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInvoiceDto) {
    const workOrder = await this.prisma.workOrder.findUniqueOrThrow({
      where: { id: dto.workOrderId },
    });

    if (workOrder.status !== 'completed') {
      throw new BadRequestException(
        `Cannot create invoice for work order in "${workOrder.status}" state. Work order must be "completed".`,
      );
    }

    this.logger.log(`Creating invoice for work order ${dto.workOrderId}: $${dto.amount / 100}`);

    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          workOrderId: dto.workOrderId,
          amount: dto.amount,
          currency: dto.currency ?? 'usd',
          status: 'sent',
        },
      });

      await tx.workOrder.update({
        where: { id: dto.workOrderId },
        data: { status: 'invoiced' },
      });

      await tx.workOrderStatusHistory.create({
        data: {
          workOrderId: dto.workOrderId,
          fromStatus: 'completed',
          toStatus: 'invoiced',
          note: `Invoice #${invoice.id} created`,
        },
      });

      return invoice;
    });
  }

  async findByCompany(companyId: string) {
    return this.prisma.invoice.findMany({
      where: { workOrder: { companyId } },
      include: { workOrder: { include: { customer: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.invoice.findUniqueOrThrow({
      where: { id },
      include: { workOrder: { include: { customer: true, technician: true } } },
    });
  }

  async markPaid(id: string) {
    const invoice = await this.prisma.invoice.findUniqueOrThrow({
      where: { id },
    });

    if (invoice.status !== 'sent') {
      throw new BadRequestException(
        `Cannot mark invoice as paid — current status is "${invoice.status}"`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.workOrder.update({
        where: { id: invoice.workOrderId },
        data: { status: 'paid' },
      });

      await tx.workOrderStatusHistory.create({
        data: {
          workOrderId: invoice.workOrderId,
          fromStatus: 'invoiced',
          toStatus: 'paid',
          note: `Invoice #${id} paid`,
        },
      });

      return tx.invoice.update({
        where: { id },
        data: { status: 'paid', paidAt: new Date() },
      });
    });
  }
}
