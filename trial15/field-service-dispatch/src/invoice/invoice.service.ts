import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateInvoiceDto) {
    // Verify work order belongs to company
    // findFirst: scoped by companyId for tenant isolation
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: dto.workOrderId, companyId },
    });

    if (!workOrder) {
      throw new NotFoundException(`Work order with id ${dto.workOrderId} not found`);
    }

    if (workOrder.status !== 'COMPLETED') {
      throw new BadRequestException('Work order must be COMPLETED before invoicing');
    }

    return this.prisma.invoice.create({
      data: {
        amount: dto.amount,
        description: dto.description,
        workOrderId: dto.workOrderId,
        companyId,
      },
      include: { workOrder: true },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.invoice.findMany({
      where: { companyId },
      include: { workOrder: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    // findFirst: scoped by companyId for tenant isolation
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
      include: { workOrder: true },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with id ${id} not found`);
    }

    return invoice;
  }

  async update(id: string, companyId: string, dto: UpdateInvoiceDto) {
    await this.findOne(id, companyId);
    return this.prisma.invoice.update({
      where: { id },
      data: dto,
      include: { workOrder: true },
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.invoice.delete({
      where: { id },
    });
  }

  async markPaid(id: string, companyId: string) {
    const invoice = await this.findOne(id, companyId);

    if (invoice.paidAt) {
      throw new BadRequestException('Invoice is already paid');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: { paidAt: new Date() },
      include: { workOrder: true },
    });
  }

  async findByWorkOrder(workOrderId: string, companyId: string) {
    return this.prisma.invoice.findMany({
      where: { workOrderId, companyId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
