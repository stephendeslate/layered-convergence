import { Injectable } from '@nestjs/common';
import { Invoice } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Invoice[]> {
    return this.prisma.invoice.findMany({
      include: {
        customer: true,
        workOrder: true,
      },
    });
  }

  async findById(id: string): Promise<Invoice | null> {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        workOrder: true,
      },
    });
  }

  async findByStatus(status: string): Promise<Invoice[]> {
    return this.prisma.invoice.findMany({
      where: { status: status as 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'VOID' },
      include: {
        customer: true,
      },
    });
  }
}
