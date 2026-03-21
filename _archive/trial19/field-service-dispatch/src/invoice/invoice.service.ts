import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { WorkOrderService } from '../work-order/work-order.service.js';

@Injectable()
export class InvoiceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workOrderService: WorkOrderService,
  ) {}

  async createFromWorkOrder(
    workOrderId: string,
    companyId: string,
    amount: number,
  ) {
    await this.workOrderService.transition(workOrderId, companyId, 'INVOICED');

    return this.prisma.invoice.create({
      data: {
        workOrderId,
        amount,
      },
    });
  }

  async markPaid(id: string, companyId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { workOrder: true },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice ${id} not found`);
    }

    await this.workOrderService.transition(
      invoice.workOrderId,
      companyId,
      'PAID',
    );

    return this.prisma.invoice.update({
      where: { id },
      data: { status: 'PAID' },
    });
  }

  async findAllByCompany(companyId: string) {
    return this.prisma.invoice.findMany({
      where: { workOrder: { companyId } },
      include: { workOrder: true },
    });
  }
}
