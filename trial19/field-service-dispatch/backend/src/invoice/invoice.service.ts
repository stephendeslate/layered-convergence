import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkOrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.invoice.findMany({
      where: { companyId },
      include: { workOrder: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, companyId: string) {
    // findFirst justified: filtering by both id AND companyId for tenant isolation
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
      include: { workOrder: true },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return invoice;
  }

  async create(dto: CreateInvoiceDto, companyId: string) {
    // findFirst justified: filtering by both id AND companyId for tenant isolation
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: dto.workOrderId, companyId },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    if (workOrder.status !== WorkOrderStatus.COMPLETED) {
      throw new BadRequestException('Work order must be COMPLETED before invoicing');
    }

    const invoice = await this.prisma.invoice.create({
      data: {
        amount: new Decimal(dto.amount),
        tax: new Decimal(dto.tax),
        total: new Decimal(dto.total),
        workOrderId: dto.workOrderId,
        companyId,
      },
      include: { workOrder: true },
    });

    await this.prisma.workOrder.update({
      where: { id: dto.workOrderId },
      data: { status: WorkOrderStatus.INVOICED },
    });

    return invoice;
  }
}
