import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);
  private invoiceCounter = 0;

  constructor(private prisma: PrismaService) {}

  private async generateInvoiceNumber(companyId: string): Promise<string> {
    const count = await this.prisma.invoice.count({ where: { companyId } });
    const num = count + 1;
    return `INV-${num.toString().padStart(5, '0')}`;
  }

  async create(companyId: string, dto: CreateInvoiceDto) {
    const workOrder = await this.prisma.workOrder.findFirstOrThrow({
      where: { id: dto.workOrderId, companyId },
    });

    const existing = await this.prisma.invoice.findUnique({
      where: { workOrderId: dto.workOrderId },
    });

    if (existing) {
      throw new BadRequestException('Invoice already exists for this work order');
    }

    if (workOrder.status !== 'COMPLETED' && workOrder.status !== 'INVOICED') {
      throw new BadRequestException('Work order must be COMPLETED or INVOICED to create an invoice');
    }

    const invoiceNumber = await this.generateInvoiceNumber(companyId);
    const tax = dto.tax ?? 0;
    const total = dto.amount + tax;

    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          companyId,
          workOrderId: dto.workOrderId,
          invoiceNumber,
          amount: dto.amount,
          tax,
          total,
          description: dto.description,
          lineItems: dto.lineItems ?? [],
          dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        },
      });

      if (workOrder.status === 'COMPLETED') {
        await tx.workOrder.update({
          where: { id: dto.workOrderId },
          data: { status: 'INVOICED' },
        });

        await tx.workOrderStatusHistory.create({
          data: {
            workOrderId: dto.workOrderId,
            companyId,
            fromStatus: 'COMPLETED',
            toStatus: 'INVOICED',
            note: `Invoice ${invoiceNumber} created`,
          },
        });
      }

      return invoice;
    });
  }

  async findAll(companyId: string) {
    return this.prisma.invoice.findMany({
      where: { companyId },
      include: {
        workOrder: { select: { id: true, title: true, address: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, companyId: string) {
    return this.prisma.invoice.findFirstOrThrow({
      where: { id, companyId },
      include: {
        workOrder: {
          include: {
            customer: true,
            technician: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  async markAsPaid(id: string, companyId: string) {
    const invoice = await this.prisma.invoice.findFirstOrThrow({
      where: { id, companyId },
    });

    if (invoice.status !== 'SENT' && invoice.status !== 'DRAFT') {
      throw new BadRequestException('Invoice must be DRAFT or SENT to mark as paid');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.invoice.update({
        where: { id },
        data: { status: 'PAID', paidAt: new Date() },
      });

      await tx.workOrder.update({
        where: { id: invoice.workOrderId },
        data: { status: 'PAID' },
      });

      await tx.workOrderStatusHistory.create({
        data: {
          workOrderId: invoice.workOrderId,
          companyId,
          fromStatus: 'INVOICED',
          toStatus: 'PAID',
          note: `Invoice ${invoice.invoiceNumber} paid`,
        },
      });

      return updated;
    });
  }

  async send(id: string, companyId: string) {
    const invoice = await this.prisma.invoice.findFirstOrThrow({
      where: { id, companyId },
    });

    if (invoice.status !== 'DRAFT') {
      throw new BadRequestException('Only DRAFT invoices can be sent');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: { status: 'SENT' },
    });
  }

  async void(id: string, companyId: string) {
    const invoice = await this.prisma.invoice.findFirstOrThrow({
      where: { id, companyId },
    });

    if (invoice.status === 'PAID') {
      throw new BadRequestException('Cannot void a paid invoice');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: { status: 'VOID' },
    });
  }
}
