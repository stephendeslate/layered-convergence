import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkOrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/invoice.dto';

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateInvoiceDto) {
    // findFirst with companyId for tenant isolation
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: dto.workOrderId, companyId },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    if (workOrder.status !== WorkOrderStatus.COMPLETED) {
      throw new BadRequestException('Can only invoice completed work orders');
    }

    const tax = dto.tax ?? 0;
    const total = dto.amount + tax;

    const invoice = await this.prisma.invoice.create({
      data: {
        number: dto.number,
        amount: dto.amount,
        tax,
        total,
        notes: dto.notes,
        workOrderId: dto.workOrderId,
        companyId,
      },
      include: { workOrder: true },
    });

    // Transition work order to INVOICED
    await this.prisma.workOrder.update({
      where: { id: dto.workOrderId },
      data: { status: WorkOrderStatus.INVOICED },
    });

    return invoice;
  }

  async findAll(companyId: string) {
    return this.prisma.invoice.findMany({
      where: { companyId },
      include: { workOrder: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(companyId: string, id: string) {
    // findFirst with companyId for tenant isolation
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
      include: { workOrder: { include: { customer: true, technician: true } } },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }
}
