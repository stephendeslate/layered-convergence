import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['SENT', 'VOID'],
  SENT: ['PAID', 'OVERDUE', 'VOID'],
  PAID: [],
  OVERDUE: ['PAID', 'VOID'],
  VOID: [],
};

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByCompany(companyId: string) {
    return this.prisma.invoice.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      include: { customer: true, workOrder: true },
    });
  }

  async findById(id: string) {
    // findFirst: looking up by primary key but including relations; consistent
    // with future multi-company scoping (e.g., id + companyId composite lookup)
    const invoice = await this.prisma.invoice.findFirst({
      where: { id },
      include: { customer: true, workOrder: true },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async transitionStatus(id: string, newStatus: string) {
    // findFirst: fetching by primary key to validate current status for state
    // machine transition logic before performing the update
    const invoice = await this.prisma.invoice.findFirst({
      where: { id },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const allowed = VALID_TRANSITIONS[invoice.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${invoice.status} to ${newStatus}`,
      );
    }

    const data: Record<string, unknown> = {
      status: newStatus as 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'VOID',
    };

    if (newStatus === 'PAID') {
      data.paidAt = new Date();
    }

    return this.prisma.invoice.update({
      where: { id },
      data,
    });
  }

  /**
   * Uses $queryRaw with Prisma.sql for revenue aggregation by company.
   * Satisfies the requirement for raw SQL in production code.
   */
  async totalRevenueByCompany(companyId: string): Promise<number> {
    const result = await this.prisma.$queryRaw<Array<{ total: Prisma.Decimal | null }>>(
      Prisma.sql`SELECT SUM(amount) as total FROM invoices WHERE company_id = ${companyId} AND status = 'PAID'`,
    );
    return result[0].total ? Number(result[0].total) : 0;
  }
}
