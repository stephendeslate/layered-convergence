import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { WorkOrderStatus } from '../../generated/prisma/client.js';
import { CreateInvoiceDto } from './dto/create-invoice.dto.js';

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async createForWorkOrder(companyId: string, workOrderId: string, dto: CreateInvoiceDto) {
    // findFirst required: scoping by companyId for tenant isolation
    const workOrder = await this.prisma.workOrder.findFirstOrThrow({
      where: { id: workOrderId, companyId },
    });

    if (workOrder.status !== WorkOrderStatus.COMPLETED) {
      throw new BadRequestException('Work order must be COMPLETED to create invoice');
    }

    const [invoice] = await this.prisma.$transaction([
      this.prisma.invoice.create({
        data: {
          workOrderId,
          amount: dto.amount,
        },
      }),
      this.prisma.workOrder.update({
        where: { id: workOrderId },
        data: { status: WorkOrderStatus.INVOICED },
      }),
      this.prisma.workOrderStatusHistory.create({
        data: {
          workOrderId,
          fromStatus: WorkOrderStatus.COMPLETED,
          toStatus: WorkOrderStatus.INVOICED,
          note: 'Invoice created',
        },
      }),
    ]);

    return invoice;
  }

  findAll(companyId: string) {
    return this.prisma.invoice.findMany({
      where: { workOrder: { companyId } },
      include: { workOrder: true },
    });
  }

  findOne(id: string) {
    return this.prisma.invoice.findUniqueOrThrow({
      where: { id },
      include: { workOrder: true },
    });
  }
}
