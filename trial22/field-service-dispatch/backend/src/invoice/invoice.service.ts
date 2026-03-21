import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { WorkOrderService } from '../work-order/work-order.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

// TRACED:AC-008 Invoice creation requires COMPLETED work order
@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly workOrderService: WorkOrderService,
  ) {}

  async findAll(companyId: string) {
    return this.prisma.invoice.findMany({
      where: { companyId },
      include: { workOrder: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    // findFirst: safe because we filter by both id (PK) and companyId for tenant isolation
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
      include: { workOrder: true },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async create(dto: CreateInvoiceDto, companyId: string) {
    const workOrder = await this.workOrderService.findOne(
      dto.workOrderId,
      companyId,
    );

    if (workOrder.status !== 'COMPLETED') {
      throw new ConflictException(
        `Work order must be COMPLETED to create an invoice. Current status: ${workOrder.status}`,
      );
    }

    const amount = new Decimal(dto.amount);
    const taxAmount = new Decimal(dto.taxAmount);
    const totalAmount = amount.add(taxAmount);

    const invoiceNumber = `INV-${Date.now()}`;

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        amount,
        taxAmount,
        totalAmount,
        workOrderId: dto.workOrderId,
        companyId,
      },
      include: { workOrder: true },
    });

    // Transition work order to INVOICED
    await this.prisma.workOrder.update({
      where: { id: dto.workOrderId },
      data: { status: 'INVOICED' },
    });

    this.logger.log(`Invoice created: ${invoice.id} for work order ${dto.workOrderId}`);
    return invoice;
  }
}
