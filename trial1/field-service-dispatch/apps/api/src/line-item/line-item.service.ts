import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

export interface CreateLineItemDto {
  workOrderId: string;
  type: string; // LABOR, MATERIAL, FLAT_RATE, DISCOUNT, TAX
  description: string;
  quantity: number;
  unitPrice: number;
  sortOrder?: number;
}

export interface UpdateLineItemDto {
  description?: string;
  quantity?: number;
  unitPrice?: number;
  sortOrder?: number;
}

export interface WorkOrderTotals {
  workOrderId: string;
  subtotal: number;
  discounts: number;
  taxAmount: number;
  total: number;
  lineItems: Array<{
    id: string;
    type: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    sortOrder: number;
  }>;
}

@Injectable()
export class LineItemService {
  private readonly logger = new Logger(LineItemService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Add a line item to a work order.
   */
  async create(companyId: string, dto: CreateLineItemDto, userId?: string) {
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: dto.workOrderId, companyId },
      include: { invoice: true },
    });

    if (!workOrder) {
      throw new NotFoundException(`Work order ${dto.workOrderId} not found`);
    }

    // Don't allow adding items if invoice already sent
    if (workOrder.invoice && workOrder.invoice.status !== 'DRAFT') {
      throw new BadRequestException(
        'Cannot modify line items after invoice has been sent',
      );
    }

    const totalPrice = this.calculateTotalPrice(dto.type, dto.quantity, dto.unitPrice);

    const lineItem = await this.prisma.lineItem.create({
      data: {
        companyId,
        workOrderId: dto.workOrderId,
        invoiceId: workOrder.invoice?.id,
        type: dto.type as any,
        description: dto.description,
        quantity: dto.quantity,
        unitPrice: dto.unitPrice,
        totalPrice,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

    await this.audit.log({
      companyId,
      userId,
      action: 'line_item.create',
      entityType: 'LineItem',
      entityId: lineItem.id,
      metadata: {
        workOrderId: dto.workOrderId,
        type: dto.type,
        totalPrice,
      },
    });

    return lineItem;
  }

  /**
   * Update a line item.
   */
  async update(
    companyId: string,
    lineItemId: string,
    dto: UpdateLineItemDto,
    userId?: string,
  ) {
    const lineItem = await this.getOrThrow(companyId, lineItemId);

    // Recalculate total if quantity or unit price changed
    const quantity = dto.quantity ?? Number(lineItem.quantity);
    const unitPrice = dto.unitPrice ?? Number(lineItem.unitPrice);
    const totalPrice = this.calculateTotalPrice(lineItem.type, quantity, unitPrice);

    const data: any = { totalPrice };
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.quantity !== undefined) data.quantity = dto.quantity;
    if (dto.unitPrice !== undefined) data.unitPrice = dto.unitPrice;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;

    const updated = await this.prisma.lineItem.update({
      where: { id: lineItemId },
      data,
    });

    await this.audit.log({
      companyId,
      userId,
      action: 'line_item.update',
      entityType: 'LineItem',
      entityId: lineItemId,
      metadata: { updatedFields: Object.keys(dto) },
    });

    return updated;
  }

  /**
   * Delete a line item.
   */
  async delete(companyId: string, lineItemId: string, userId?: string) {
    await this.getOrThrow(companyId, lineItemId);

    await this.prisma.lineItem.delete({
      where: { id: lineItemId },
    });

    await this.audit.log({
      companyId,
      userId,
      action: 'line_item.delete',
      entityType: 'LineItem',
      entityId: lineItemId,
    });
  }

  /**
   * Get all line items for a work order.
   */
  async listByWorkOrder(companyId: string, workOrderId: string) {
    return this.prisma.lineItem.findMany({
      where: { companyId, workOrderId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Calculate work order totals from line items.
   */
  async calculateTotals(
    companyId: string,
    workOrderId: string,
  ): Promise<WorkOrderTotals> {
    const lineItems = await this.prisma.lineItem.findMany({
      where: { companyId, workOrderId },
      orderBy: { sortOrder: 'asc' },
    });

    let subtotal = 0;
    let discounts = 0;
    let taxAmount = 0;

    for (const item of lineItems) {
      const total = Number(item.totalPrice);
      switch (item.type) {
        case 'DISCOUNT':
          discounts += Math.abs(total);
          break;
        case 'TAX':
          taxAmount += total;
          break;
        default:
          subtotal += total;
          break;
      }
    }

    return {
      workOrderId,
      subtotal: Math.round(subtotal * 100) / 100,
      discounts: Math.round(discounts * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round((subtotal - discounts + taxAmount) * 100) / 100,
      lineItems: lineItems.map((item) => ({
        id: item.id,
        type: item.type,
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        sortOrder: item.sortOrder,
      })),
    };
  }

  /**
   * Bulk add line items to a work order.
   */
  async bulkCreate(
    companyId: string,
    workOrderId: string,
    items: Omit<CreateLineItemDto, 'workOrderId'>[],
    userId?: string,
  ) {
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId, companyId },
    });

    if (!workOrder) {
      throw new NotFoundException(`Work order ${workOrderId} not found`);
    }

    const created = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const totalPrice = this.calculateTotalPrice(item.type, item.quantity, item.unitPrice);

      const lineItem = await this.prisma.lineItem.create({
        data: {
          companyId,
          workOrderId,
          type: item.type as any,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice,
          sortOrder: item.sortOrder ?? i,
        },
      });
      created.push(lineItem);
    }

    await this.audit.log({
      companyId,
      userId,
      action: 'line_item.bulk_create',
      entityType: 'WorkOrder',
      entityId: workOrderId,
      metadata: { count: created.length },
    });

    return created;
  }

  private calculateTotalPrice(
    type: string,
    quantity: number,
    unitPrice: number,
  ): number {
    const total = quantity * unitPrice;
    // Discounts are stored as negative
    if (type === 'DISCOUNT') {
      return -Math.abs(total);
    }
    return Math.round(total * 100) / 100;
  }

  private async getOrThrow(companyId: string, lineItemId: string) {
    const lineItem = await this.prisma.lineItem.findFirst({
      where: { id: lineItemId, companyId },
    });

    if (!lineItem) {
      throw new NotFoundException(`Line item ${lineItemId} not found`);
    }

    return lineItem;
  }
}
