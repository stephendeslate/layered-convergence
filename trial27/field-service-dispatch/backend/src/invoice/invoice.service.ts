// [TRACED:FD-006] Invoice generation and lifecycle management
import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { CompanyService } from "../company/company.service";

const VALID_INVOICE_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["SENT", "VOID"],
  SENT: ["PAID", "OVERDUE", "VOID"],
  OVERDUE: ["PAID", "VOID"],
  PAID: [],
  VOID: [],
};

@Injectable()
export class InvoiceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companyService: CompanyService,
  ) {}

  async create(data: {
    amount: number;
    tax: number;
    total: number;
    companyId: string;
    customerId: string;
    workOrderId: string;
  }) {
    await this.companyService.setCompanyContext(data.companyId);
    return this.prisma.invoice.create({
      data: {
        amount: data.amount,
        tax: data.tax,
        total: data.total,
        companyId: data.companyId,
        customerId: data.customerId,
        workOrderId: data.workOrderId,
      },
    });
  }

  async transition(invoiceId: string, newStatus: string, companyId: string) {
    await this.companyService.setCompanyContext(companyId);

    // findFirst: invoice lookup by ID within company context for RLS compliance
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new BadRequestException("Invoice not found");
    }

    const allowed = VALID_INVOICE_TRANSITIONS[invoice.status];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${invoice.status} to ${newStatus}`,
      );
    }

    const updateData: Record<string, unknown> = {
      status: newStatus as "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "VOID",
    };

    if (newStatus === "SENT") {
      updateData.issuedAt = new Date();
    }
    if (newStatus === "PAID") {
      updateData.paidAt = new Date();
    }

    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: updateData,
    });
  }

  async findByCompany(companyId: string) {
    await this.companyService.setCompanyContext(companyId);
    return this.prisma.invoice.findMany({
      include: { customer: true, workOrder: true },
    });
  }
}
