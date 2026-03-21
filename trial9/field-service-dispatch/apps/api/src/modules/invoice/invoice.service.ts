import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateInvoiceDto } from './invoice.dto';

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
        `Cannot create invoice for work order in '${workOrder.status}' state. Must be 'completed'.`,
      );
    }

    const invoice = await this.prisma.invoice.create({
      data: {
        workOrderId: dto.workOrderId,
        amount: dto.amount,
        status: 'draft',
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

    this.logger.log(`Invoice created: ${invoice.id} — $${(dto.amount / 100).toFixed(2)}`);
    return invoice;
  }

  async sendInvoice(id: string) {
    return this.prisma.invoice.update({
      where: { id },
      data: { status: 'sent' },
    });
  }

  async markPaid(id: string) {
    const invoice = await this.prisma.invoice.findUniqueOrThrow({
      where: { id },
      include: { workOrder: true },
    });

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: { status: 'paid', paidAt: new Date() },
    });

    // Transition work order to paid
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

    this.logger.log(`Invoice ${id} marked as paid`);
    return updated;
  }

  async findById(id: string) {
    return this.prisma.invoice.findUniqueOrThrow({
      where: { id },
      include: { workOrder: { include: { customer: true } } },
    });
  }

  async findByCompany(companyId: string) {
    return this.prisma.invoice.findMany({
      where: { workOrder: { companyId } },
      include: { workOrder: { include: { customer: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
