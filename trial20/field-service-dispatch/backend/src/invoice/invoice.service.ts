import { Injectable, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyContextService } from '../company-context/company-context.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoiceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companyContext: CompanyContextService,
  ) {}

  async findAll(companyId: string) {
    await this.companyContext.setCompanyContext(companyId);
    return this.prisma.invoice.findMany({
      where: { companyId },
      include: {
        workOrder: { select: { title: true, customer: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    await this.companyContext.setCompanyContext(companyId);
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
      include: {
        workOrder: { include: { customer: true } },
      },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return invoice;
  }

  async create(dto: CreateInvoiceDto, companyId: string) {
    await this.companyContext.setCompanyContext(companyId);
    const amount = new Decimal(dto.amount);
    const tax = new Decimal(dto.tax);
    const total = amount.add(tax);

    return this.prisma.invoice.create({
      data: {
        workOrderId: dto.workOrderId,
        amount,
        tax,
        total,
        companyId,
      },
    });
  }

  async update(id: string, dto: UpdateInvoiceDto, companyId: string) {
    await this.companyContext.setCompanyContext(companyId);
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const data: Record<string, unknown> = {};
    if (dto.status) {
      data.status = dto.status;
    }
    if (dto.amount !== undefined && dto.tax !== undefined) {
      data.amount = new Decimal(dto.amount);
      data.tax = new Decimal(dto.tax);
      data.total = new Decimal(dto.amount).add(new Decimal(dto.tax));
    }

    return this.prisma.invoice.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, companyId: string) {
    await this.companyContext.setCompanyContext(companyId);
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return this.prisma.invoice.delete({ where: { id } });
  }
}
