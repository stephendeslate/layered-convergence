import { Injectable, NotFoundException } from '@nestjs/common';
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
    const amount = new Decimal(dto.amount);
    const tax = new Decimal(dto.tax);
    const total = amount.add(tax);

    return this.prisma.invoice.create({
      data: {
        amount,
        tax,
        total,
        workOrderId: dto.workOrderId,
        companyId,
      },
      include: { workOrder: true },
    });
  }
}
