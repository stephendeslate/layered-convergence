// [TRACED:DM-009] Invoice state machine: DRAFT->SENT->PAID->VOID
// [TRACED:API-009] Invoice CRUD and transition endpoints

import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InvoiceStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const VALID_INVOICE_TRANSITIONS: Record<string, InvoiceStatus[]> = {
  DRAFT: [InvoiceStatus.SENT, InvoiceStatus.VOID],
  SENT: [InvoiceStatus.PAID, InvoiceStatus.VOID],
  PAID: [InvoiceStatus.VOID],
  VOID: [],
};

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.invoice.findMany({
      where: { companyId },
      include: { workOrder: true, customer: true },
    });
  }

  async findOne(id: string, companyId: string) {
    // findFirst justified: fetching by primary key + company scope for multi-tenant RLS verification
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
      include: { workOrder: true, customer: true },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async create(data: {
    invoiceNumber: string;
    amount: number;
    taxAmount: number;
    totalAmount: number;
    dueDate?: Date;
    workOrderId: string;
    customerId: string;
    companyId: string;
  }) {
    return this.prisma.invoice.create({
      data: {
        invoiceNumber: data.invoiceNumber,
        amount: data.amount,
        taxAmount: data.taxAmount,
        totalAmount: data.totalAmount,
        dueDate: data.dueDate,
        workOrderId: data.workOrderId,
        customerId: data.customerId,
        companyId: data.companyId,
        status: InvoiceStatus.DRAFT,
      },
    });
  }

  async transition(id: string, companyId: string, newStatus: InvoiceStatus) {
    const invoice = await this.findOne(id, companyId);
    const currentStatus = invoice.status;
    const allowed = VALID_INVOICE_TRANSITIONS[currentStatus] ?? [];

    if (!allowed.includes(newStatus)) {
      throw new ConflictException(
        `Cannot transition invoice from ${currentStatus} to ${newStatus}`,
      );
    }

    return this.prisma.invoice.update({
      where: { id },
      data: { status: newStatus },
    });
  }
}
