import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvoiceDto, UpdateInvoiceStatusDto } from './invoice.dto';

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateInvoiceDto) {
    const workOrder = await this.prisma.workOrder.findFirstOrThrow({
      where: { id: dto.workOrderId, companyId },
    });

    if (workOrder.status !== 'COMPLETED') {
      throw new BadRequestException('Can only create invoices for completed work orders');
    }

    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          workOrderId: dto.workOrderId,
          amount: dto.amount,
          status: 'DRAFT',
        },
        include: { workOrder: { include: { customer: true } } },
      });

      await tx.workOrder.update({
        where: { id: dto.workOrderId },
        data: { status: 'INVOICED' },
      });

      await tx.workOrderStatusHistory.create({
        data: {
          workOrderId: dto.workOrderId,
          fromStatus: 'COMPLETED',
          toStatus: 'INVOICED',
          note: `Invoice ${invoice.id} created`,
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

  async findById(companyId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirstOrThrow({
      where: { id },
      include: { workOrder: { include: { customer: true, technician: true } } },
    });

    if (invoice.workOrder.companyId !== companyId) {
      throw new BadRequestException('Invoice not found for this company');
    }

    return invoice;
  }

  async updateStatus(companyId: string, id: string, dto: UpdateInvoiceStatusDto) {
    const invoice = await this.prisma.invoice.findFirstOrThrow({
      where: { id },
      include: { workOrder: true },
    });

    if (invoice.workOrder.companyId !== companyId) {
      throw new BadRequestException('Invoice not found for this company');
    }

    // Side effect: PAID status transitions work order to PAID
    if (dto.status === 'PAID') {
      return this.prisma.$transaction(async (tx) => {
        const updated = await tx.invoice.update({
          where: { id },
          data: { status: dto.status as never },
          include: { workOrder: true },
        });

        await tx.workOrder.update({
          where: { id: invoice.workOrderId },
          data: { status: 'PAID' },
        });

        await tx.workOrderStatusHistory.create({
          data: {
            workOrderId: invoice.workOrderId,
            fromStatus: 'INVOICED',
            toStatus: 'PAID',
            note: `Invoice ${id} paid`,
          },
        });

        return updated;
      });
    }

    return this.prisma.invoice.update({
      where: { id },
      data: { status: dto.status as never },
      include: { workOrder: true },
    });
  }
}
