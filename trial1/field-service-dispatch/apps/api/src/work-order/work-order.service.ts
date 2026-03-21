import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { BullMqService, QUEUE_NAMES } from '../bullmq/bullmq.service';
import {
  WorkOrderStatus,
  WORK_ORDER_TRANSITIONS,
  TechnicianStatus,
} from '@fsd/shared';
import { v4 as uuid } from 'uuid';

export interface CreateWorkOrderDto {
  customerId: string;
  technicianId?: string;
  serviceType: string;
  priority?: string;
  description?: string;
  notes?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  scheduledStart: string;
  scheduledEnd: string;
  estimatedMinutes?: number;
}

export interface CompleteWorkOrderDto {
  notes?: string;
  lineItems?: Array<{
    type: string;
    description: string;
    quantity: number;
    unitPrice: number;
    sortOrder?: number;
  }>;
}

export interface WorkOrderListQuery {
  page?: number;
  pageSize?: number;
  status?: string;
  technicianId?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  priority?: string;
  serviceType?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class WorkOrderService {
  private readonly logger = new Logger(WorkOrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly bullmq: BullMqService,
  ) {}

  /**
   * Create a new work order in UNASSIGNED state.
   */
  async create(companyId: string, dto: CreateWorkOrderDto, userId?: string) {
    // Generate company-scoped reference number
    const referenceNumber = await this.generateReferenceNumber(companyId);

    const workOrder = await this.prisma.workOrder.create({
      data: {
        companyId,
        customerId: dto.customerId,
        referenceNumber,
        status: WorkOrderStatus.UNASSIGNED,
        priority: (dto.priority as any) ?? 'NORMAL',
        serviceType: dto.serviceType as any,
        description: dto.description,
        notes: dto.notes,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        zipCode: dto.zipCode,
        latitude: dto.latitude,
        longitude: dto.longitude,
        scheduledStart: new Date(dto.scheduledStart),
        scheduledEnd: new Date(dto.scheduledEnd),
        estimatedMinutes: dto.estimatedMinutes ?? 60,
      },
      include: {
        customer: true,
        technician: { include: { user: { select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } } } },
      },
    });

    // Create initial status history
    await this.prisma.workOrderStatusHistory.create({
      data: {
        companyId,
        workOrderId: workOrder.id,
        fromStatus: null,
        toStatus: WorkOrderStatus.UNASSIGNED,
        changedById: userId,
        notes: 'Work order created',
      },
    });

    await this.audit.logWorkOrderTransition(
      companyId,
      userId,
      workOrder.id,
      null,
      WorkOrderStatus.UNASSIGNED,
      { referenceNumber },
    );

    return workOrder;
  }

  /**
   * Assign a technician to a work order (UNASSIGNED -> ASSIGNED).
   */
  async assign(
    companyId: string,
    workOrderId: string,
    technicianId: string,
    userId?: string,
  ) {
    const workOrder = await this.getOrThrow(companyId, workOrderId);
    this.validateTransition(workOrder.status, WorkOrderStatus.ASSIGNED);

    // Validate technician exists and belongs to the same company
    const technician = await this.prisma.technician.findFirst({
      where: { id: technicianId, companyId },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    if (!technician) {
      throw new BadRequestException('Technician not found in this company');
    }

    // Check technician availability
    if (
      technician.status !== TechnicianStatus.AVAILABLE &&
      technician.status !== TechnicianStatus.ON_BREAK
    ) {
      throw new BadRequestException(
        `Technician is not available (current status: ${technician.status})`,
      );
    }

    // Check skill match
    const techSkills = technician.skills as string[];
    if (!techSkills.includes(workOrder.serviceType)) {
      throw new BadRequestException(
        `Technician does not have the required skill: ${workOrder.serviceType}`,
      );
    }

    const updated = await this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: {
        status: WorkOrderStatus.ASSIGNED,
        technicianId,
      },
      include: {
        customer: true,
        technician: { include: { user: { select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } } } },
      },
    });

    await this.createStatusHistory(
      companyId,
      workOrderId,
      workOrder.status,
      WorkOrderStatus.ASSIGNED,
      userId,
      `Assigned to ${technician.user.firstName} ${technician.user.lastName}`,
    );

    await this.audit.logWorkOrderTransition(
      companyId,
      userId,
      workOrderId,
      workOrder.status,
      WorkOrderStatus.ASSIGNED,
      { technicianId },
    );

    // Queue notification
    await this.bullmq.addJob(QUEUE_NAMES.NOTIFICATIONS, 'new-assignment', {
      companyId,
      workOrderId,
      technicianId,
    });

    return updated;
  }

  /**
   * Start route (ASSIGNED -> EN_ROUTE).
   */
  async startRoute(companyId: string, workOrderId: string, userId?: string) {
    const workOrder = await this.getOrThrow(companyId, workOrderId);
    this.validateTransition(workOrder.status, WorkOrderStatus.EN_ROUTE);

    // Generate tracking token
    const trackingToken = uuid();
    const trackingExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const updated = await this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: {
        status: WorkOrderStatus.EN_ROUTE,
        trackingToken,
        trackingExpiresAt,
      },
      include: {
        customer: true,
        technician: { include: { user: { select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } } } },
      },
    });

    // Update technician status
    if (workOrder.technicianId) {
      await this.prisma.technician.update({
        where: { id: workOrder.technicianId },
        data: { status: TechnicianStatus.EN_ROUTE },
      });
    }

    await this.createStatusHistory(
      companyId,
      workOrderId,
      workOrder.status,
      WorkOrderStatus.EN_ROUTE,
      userId,
      'Technician started route',
    );

    await this.audit.logWorkOrderTransition(
      companyId,
      userId,
      workOrderId,
      workOrder.status,
      WorkOrderStatus.EN_ROUTE,
      { trackingToken },
    );

    // Queue ETA calculation and customer notification
    await this.bullmq.addJob(QUEUE_NAMES.NOTIFICATIONS, 'technician-en-route', {
      companyId,
      workOrderId,
      trackingToken,
    });

    return updated;
  }

  /**
   * Arrive at site (EN_ROUTE -> ON_SITE).
   */
  async arrive(
    companyId: string,
    workOrderId: string,
    userId?: string,
    latitude?: number,
    longitude?: number,
  ) {
    const workOrder = await this.getOrThrow(companyId, workOrderId);
    this.validateTransition(workOrder.status, WorkOrderStatus.ON_SITE);

    const updated = await this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: {
        status: WorkOrderStatus.ON_SITE,
        actualStart: workOrder.actualStart ?? new Date(),
      },
      include: {
        customer: true,
        technician: { include: { user: { select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } } } },
      },
    });

    // Update technician status
    if (workOrder.technicianId) {
      await this.prisma.technician.update({
        where: { id: workOrder.technicianId },
        data: { status: TechnicianStatus.ON_JOB },
      });
    }

    await this.createStatusHistory(
      companyId,
      workOrderId,
      workOrder.status,
      WorkOrderStatus.ON_SITE,
      userId,
      'Technician arrived on site',
      latitude,
      longitude,
    );

    await this.audit.logWorkOrderTransition(
      companyId,
      userId,
      workOrderId,
      workOrder.status,
      WorkOrderStatus.ON_SITE,
      { latitude, longitude },
    );

    return updated;
  }

  /**
   * Start work (ON_SITE -> IN_PROGRESS).
   */
  async startWork(companyId: string, workOrderId: string, userId?: string) {
    const workOrder = await this.getOrThrow(companyId, workOrderId);
    this.validateTransition(workOrder.status, WorkOrderStatus.IN_PROGRESS);

    const updated = await this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: {
        status: WorkOrderStatus.IN_PROGRESS,
        actualStart: workOrder.actualStart ?? new Date(),
      },
      include: {
        customer: true,
        technician: { include: { user: { select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } } } },
      },
    });

    await this.createStatusHistory(
      companyId,
      workOrderId,
      workOrder.status,
      WorkOrderStatus.IN_PROGRESS,
      userId,
      'Work started',
    );

    await this.audit.logWorkOrderTransition(
      companyId,
      userId,
      workOrderId,
      workOrder.status,
      WorkOrderStatus.IN_PROGRESS,
    );

    return updated;
  }

  /**
   * Complete work (IN_PROGRESS -> COMPLETED).
   */
  async complete(
    companyId: string,
    workOrderId: string,
    dto: CompleteWorkOrderDto,
    userId?: string,
  ) {
    const workOrder = await this.getOrThrow(companyId, workOrderId);
    this.validateTransition(workOrder.status, WorkOrderStatus.COMPLETED);

    // Create line items if provided
    if (dto.lineItems && dto.lineItems.length > 0) {
      await this.prisma.lineItem.createMany({
        data: dto.lineItems.map((item) => ({
          companyId,
          workOrderId,
          type: item.type as any,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
          sortOrder: item.sortOrder ?? 0,
        })),
      });
    }

    const updated = await this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: {
        status: WorkOrderStatus.COMPLETED,
        actualEnd: new Date(),
        notes: dto.notes ? (workOrder.notes ? `${workOrder.notes}\n${dto.notes}` : dto.notes) : workOrder.notes,
      },
      include: {
        customer: true,
        technician: { include: { user: { select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } } } },
        lineItems: true,
      },
    });

    // Update technician status back to AVAILABLE
    if (workOrder.technicianId) {
      await this.prisma.technician.update({
        where: { id: workOrder.technicianId },
        data: { status: TechnicianStatus.AVAILABLE },
      });
    }

    await this.createStatusHistory(
      companyId,
      workOrderId,
      workOrder.status,
      WorkOrderStatus.COMPLETED,
      userId,
      dto.notes ?? 'Work completed',
    );

    await this.audit.logWorkOrderTransition(
      companyId,
      userId,
      workOrderId,
      workOrder.status,
      WorkOrderStatus.COMPLETED,
      { lineItemCount: dto.lineItems?.length ?? 0 },
    );

    // Queue invoice generation
    await this.bullmq.addJob(QUEUE_NAMES.INVOICE_GENERATION, 'generate-invoice', {
      companyId,
      workOrderId,
    });

    return updated;
  }

  /**
   * Generate invoice (COMPLETED -> INVOICED).
   */
  async generateInvoice(companyId: string, workOrderId: string, userId?: string) {
    const workOrder = await this.getOrThrow(companyId, workOrderId);
    this.validateTransition(workOrder.status, WorkOrderStatus.INVOICED);

    // Get line items
    const lineItems = await this.prisma.lineItem.findMany({
      where: { workOrderId },
    });

    if (lineItems.length === 0) {
      throw new BadRequestException('Cannot generate invoice without line items');
    }

    // Calculate totals
    const subtotal = lineItems.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0,
    );

    // Get company tax rate
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { taxRate: true },
    });
    const taxRate = Number(company?.taxRate ?? 0);
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber(companyId);

    // Create invoice
    const invoice = await this.prisma.invoice.create({
      data: {
        companyId,
        customerId: workOrder.customerId,
        workOrderId,
        invoiceNumber,
        status: 'DRAFT',
        subtotal,
        taxAmount,
        totalAmount,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Net 30
        lineItems: {
          connect: lineItems.map((item) => ({ id: item.id })),
        },
      },
    });

    // Transition work order to INVOICED
    const updated = await this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: { status: WorkOrderStatus.INVOICED },
      include: {
        customer: true,
        technician: { include: { user: { select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } } } },
        lineItems: true,
        invoice: true,
      },
    });

    await this.createStatusHistory(
      companyId,
      workOrderId,
      workOrder.status,
      WorkOrderStatus.INVOICED,
      userId,
      `Invoice ${invoiceNumber} generated`,
    );

    await this.audit.logWorkOrderTransition(
      companyId,
      userId,
      workOrderId,
      workOrder.status,
      WorkOrderStatus.INVOICED,
      { invoiceId: invoice.id, invoiceNumber, totalAmount },
    );

    return updated;
  }

  /**
   * Mark as paid (INVOICED -> PAID).
   */
  async markPaid(
    companyId: string,
    workOrderId: string,
    paymentInfo?: { stripePaymentIntentId?: string },
    userId?: string,
  ) {
    const workOrder = await this.getOrThrow(companyId, workOrderId);
    this.validateTransition(workOrder.status, WorkOrderStatus.PAID);

    // Update invoice
    const invoice = await this.prisma.invoice.findUnique({
      where: { workOrderId },
    });

    if (invoice) {
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      });
    }

    const updated = await this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: { status: WorkOrderStatus.PAID },
      include: {
        customer: true,
        technician: { include: { user: { select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } } } },
        invoice: true,
      },
    });

    await this.createStatusHistory(
      companyId,
      workOrderId,
      workOrder.status,
      WorkOrderStatus.PAID,
      userId,
      'Payment received',
    );

    await this.audit.logWorkOrderTransition(
      companyId,
      userId,
      workOrderId,
      workOrder.status,
      WorkOrderStatus.PAID,
      paymentInfo,
    );

    return updated;
  }

  /**
   * Cancel a work order (from UNASSIGNED, ASSIGNED, or EN_ROUTE).
   */
  async cancel(
    companyId: string,
    workOrderId: string,
    reason: string,
    userId?: string,
  ) {
    const workOrder = await this.getOrThrow(companyId, workOrderId);
    this.validateTransition(workOrder.status, WorkOrderStatus.CANCELLED);

    // Clear technician assignment and update their status
    if (workOrder.technicianId) {
      await this.prisma.technician.update({
        where: { id: workOrder.technicianId },
        data: { status: TechnicianStatus.AVAILABLE },
      });
    }

    const updated = await this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: {
        status: WorkOrderStatus.CANCELLED,
        technicianId: null,
        trackingToken: null,
        trackingExpiresAt: null,
      },
      include: {
        customer: true,
      },
    });

    await this.createStatusHistory(
      companyId,
      workOrderId,
      workOrder.status,
      WorkOrderStatus.CANCELLED,
      userId,
      reason,
    );

    await this.audit.logWorkOrderTransition(
      companyId,
      userId,
      workOrderId,
      workOrder.status,
      WorkOrderStatus.CANCELLED,
      { reason },
    );

    return updated;
  }

  /**
   * Get a work order by ID with full details.
   */
  async get(companyId: string, workOrderId: string) {
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId, companyId },
      include: {
        customer: true,
        technician: { include: { user: { select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } } } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
        lineItems: { orderBy: { sortOrder: 'asc' } },
        photos: { orderBy: { createdAt: 'desc' } },
        invoice: true,
      },
    });

    if (!workOrder) {
      throw new NotFoundException(`Work order ${workOrderId} not found`);
    }

    return workOrder;
  }

  /**
   * List work orders with filters and pagination.
   */
  async list(companyId: string, query: WorkOrderListQuery) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };

    if (query.status) where.status = query.status;
    if (query.technicianId) where.technicianId = query.technicianId;
    if (query.customerId) where.customerId = query.customerId;
    if (query.priority) where.priority = query.priority;
    if (query.serviceType) where.serviceType = query.serviceType;

    if (query.dateFrom || query.dateTo) {
      where.scheduledStart = {};
      if (query.dateFrom) where.scheduledStart.gte = new Date(query.dateFrom);
      if (query.dateTo) where.scheduledStart.lte = new Date(query.dateTo);
    }

    const orderBy: any = {};
    orderBy[query.sortBy ?? 'createdAt'] = query.sortOrder ?? 'desc';

    const [data, total] = await Promise.all([
      this.prisma.workOrder.findMany({
        where,
        include: {
          customer: true,
          technician: { include: { user: { select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } } } },
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      this.prisma.workOrder.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Update work order fields (non-transition update).
   */
  async update(companyId: string, workOrderId: string, dto: Partial<CreateWorkOrderDto>, userId?: string) {
    await this.getOrThrow(companyId, workOrderId);

    const data: any = { ...dto };
    if (dto.scheduledStart) data.scheduledStart = new Date(dto.scheduledStart);
    if (dto.scheduledEnd) data.scheduledEnd = new Date(dto.scheduledEnd);
    // Don't allow status changes through this method
    delete data.status;

    const updated = await this.prisma.workOrder.update({
      where: { id: workOrderId },
      data,
      include: {
        customer: true,
        technician: { include: { user: { select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } } } },
      },
    });

    await this.audit.log({
      companyId,
      userId,
      action: 'work_order.update',
      entityType: 'WorkOrder',
      entityId: workOrderId,
      metadata: { updatedFields: Object.keys(dto) },
    });

    return updated;
  }

  // ============================================================
  // Private helpers
  // ============================================================

  private validateTransition(
    currentStatus: string,
    targetStatus: WorkOrderStatus,
  ): void {
    const allowed =
      WORK_ORDER_TRANSITIONS[currentStatus as WorkOrderStatus] ?? [];

    if (!allowed.includes(targetStatus)) {
      throw new BadRequestException({
        message: `Invalid transition: cannot move from ${currentStatus} to ${targetStatus}`,
        details: {
          currentStatus,
          requestedStatus: targetStatus,
          allowedTransitions: allowed,
        },
      });
    }
  }

  private async getOrThrow(companyId: string, workOrderId: string) {
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId, companyId },
    });

    if (!workOrder) {
      throw new NotFoundException(`Work order ${workOrderId} not found`);
    }

    return workOrder;
  }

  private async createStatusHistory(
    companyId: string,
    workOrderId: string,
    fromStatus: string,
    toStatus: string,
    changedById?: string,
    notes?: string,
    latitude?: number,
    longitude?: number,
  ) {
    await this.prisma.workOrderStatusHistory.create({
      data: {
        companyId,
        workOrderId,
        fromStatus: fromStatus as any,
        toStatus: toStatus as any,
        changedById,
        notes,
        latitude,
        longitude,
      },
    });
  }

  private async generateReferenceNumber(companyId: string): Promise<string> {
    const count = await this.prisma.workOrder.count({
      where: { companyId },
    });
    return `WO-${String(count + 1).padStart(5, '0')}`;
  }

  private async generateInvoiceNumber(companyId: string): Promise<string> {
    const count = await this.prisma.invoice.count({
      where: { companyId },
    });
    return `INV-${String(count + 1).padStart(5, '0')}`;
  }
}
