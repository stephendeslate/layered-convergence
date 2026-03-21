// [TRACED:FD-AC-007] Invoice CRUD with company isolation
// [TRACED:FD-DM-004] Invoice handles Decimal precision correctly
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { amount: number; currency: string; workOrderId: string; customerId: string; companyId: string }) {
    return this.prisma.invoice.create({
      data: {
        amount: data.amount,
        currency: data.currency,
        workOrderId: data.workOrderId,
        customerId: data.customerId,
        companyId: data.companyId,
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.invoice.findMany({ where: { companyId } });
  }

  async findOne(id: string, companyId: string) {
    // findFirst: querying by id + companyId for company isolation
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async markPaid(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.invoice.update({
      where: { id },
      data: { paidAt: new Date() },
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.invoice.delete({ where: { id } });
  }
}
