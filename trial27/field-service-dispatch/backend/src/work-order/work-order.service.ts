// [TRACED:FD-004] Work order management with state machine transitions
import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { CompanyService } from "../company/company.service";

const VALID_WORK_ORDER_TRANSITIONS: Record<string, string[]> = {
  CREATED: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["EN_ROUTE", "CANCELLED"],
  EN_ROUTE: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

@Injectable()
export class WorkOrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companyService: CompanyService,
  ) {}

  async create(data: {
    title: string;
    description: string;
    priority: number;
    companyId: string;
    customerId: string;
    estimatedCost?: number;
  }) {
    await this.companyService.setCompanyContext(data.companyId);
    return this.prisma.workOrder.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        companyId: data.companyId,
        customerId: data.customerId,
        estimatedCost: data.estimatedCost,
      },
    });
  }

  async transition(workOrderId: string, newStatus: string, companyId: string) {
    await this.companyService.setCompanyContext(companyId);

    // findFirst: work order lookup by ID within company context for RLS compliance
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId },
    });

    if (!workOrder) {
      throw new BadRequestException("Work order not found");
    }

    const allowed = VALID_WORK_ORDER_TRANSITIONS[workOrder.status];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${workOrder.status} to ${newStatus}`,
      );
    }

    const updateData: Record<string, unknown> = {
      status: newStatus as
        | "CREATED"
        | "ASSIGNED"
        | "EN_ROUTE"
        | "IN_PROGRESS"
        | "COMPLETED"
        | "CANCELLED",
    };

    if (newStatus === "COMPLETED") {
      updateData.completedAt = new Date();
    }

    return this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: updateData,
    });
  }

  async findByCompany(companyId: string) {
    await this.companyService.setCompanyContext(companyId);
    return this.prisma.workOrder.findMany({
      include: { customer: true, technician: true, route: true },
    });
  }

  async assign(workOrderId: string, technicianId: string, companyId: string) {
    await this.companyService.setCompanyContext(companyId);

    // findFirst: work order lookup for assignment within RLS context
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId },
    });

    if (!workOrder) {
      throw new BadRequestException("Work order not found");
    }

    if (workOrder.status !== "CREATED") {
      throw new BadRequestException("Work order must be in CREATED status to assign");
    }

    return this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: {
        technicianId,
        status: "ASSIGNED",
      },
    });
  }
}
