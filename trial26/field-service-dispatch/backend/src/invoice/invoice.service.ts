// [TRACED:FD-003] Invoice billing DRAFT->SENT->PAID/OVERDUE
// [TRACED:FD-021] Invoice Decimal(10,2) for amount, tax, total
// [TRACED:FD-027] Invoice transition DRAFT->SENT->PAID/OVERDUE
import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { Prisma } from "@prisma/client";

// [TRACED:BE-006] Invoice service with state machine
@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  // Invoice: DRAFT -> SENT -> PAID/OVERDUE
  private readonly validTransitions: Record<string, string[]> = {
    DRAFT: ["SENT"],
    SENT: ["PAID", "OVERDUE"],
    PAID: [],
    OVERDUE: ["PAID"],
  };

  async createInvoice(data: {
    number: string;
    amount: number;
    tax: number;
    customerId: string;
    companyId: string;
    dueDate: Date;
  }) {
    const total = data.amount + data.tax;
    return this.prisma.invoice.create({
      data: {
        number: data.number,
        amount: new Prisma.Decimal(data.amount),
        tax: new Prisma.Decimal(data.tax),
        total: new Prisma.Decimal(total),
        customerId: data.customerId,
        companyId: data.companyId,
        dueDate: data.dueDate,
        status: "DRAFT",
      },
    });
  }

  async transitionInvoice(invoiceId: string, newStatus: string) {
    // findFirst justified: looking up invoice by ID for state transition
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new BadRequestException("Invoice not found");
    }

    const allowed = this.validTransitions[invoice.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition invoice from ${invoice.status} to ${newStatus}`
      );
    }

    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: newStatus as "DRAFT" | "SENT" | "PAID" | "OVERDUE",
        paidAt: newStatus === "PAID" ? new Date() : undefined,
      },
    });
  }

  async getInvoicesByCompany(companyId: string) {
    return this.prisma.invoice.findMany({
      where: { companyId },
      include: { customer: true },
    });
  }
}
