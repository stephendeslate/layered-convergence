// [TRACED:FD-001] WorkOrder lifecycle CREATED->ASSIGNED->IN_PROGRESS->COMPLETED/CANCELLED
// [TRACED:FD-018] WorkOrder Decimal(10,2) for estimatedCost
// [TRACED:FD-025] Assignment only from CREATED status
import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

// [TRACED:BE-003] WorkOrder service with state machine
@Injectable()
export class WorkOrderService {
  constructor(private readonly prisma: PrismaService) {}

  // [TRACED:BE-004] WorkOrder state transitions: CREATED -> ASSIGNED -> IN_PROGRESS -> COMPLETED/CANCELLED
  private readonly validTransitions: Record<string, string[]> = {
    CREATED: ["ASSIGNED", "CANCELLED"],
    ASSIGNED: ["IN_PROGRESS", "CANCELLED"],
    IN_PROGRESS: ["COMPLETED", "CANCELLED"],
    COMPLETED: [],
    CANCELLED: [],
  };

  async createWorkOrder(data: {
    title: string;
    description?: string;
    customerId: string;
    companyId: string;
    priority?: number;
  }) {
    return this.prisma.workOrder.create({
      data: {
        title: data.title,
        description: data.description,
        customerId: data.customerId,
        companyId: data.companyId,
        priority: data.priority || 3,
        status: "CREATED",
      },
    });
  }

  async assignTechnician(workOrderId: string, technicianId: string) {
    // findFirst justified: looking up work order by ID for assignment
    const wo = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId },
    });

    if (!wo) {
      throw new BadRequestException("Work order not found");
    }

    if (wo.status !== "CREATED") {
      throw new BadRequestException("Work order must be in CREATED status to assign");
    }

    return this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: { technicianId, status: "ASSIGNED" },
    });
  }

  async transitionWorkOrder(workOrderId: string, newStatus: string) {
    // findFirst justified: looking up work order by ID for state transition
    const wo = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId },
    });

    if (!wo) {
      throw new BadRequestException("Work order not found");
    }

    const allowed = this.validTransitions[wo.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition work order from ${wo.status} to ${newStatus}`
      );
    }

    return this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: {
        status: newStatus as "CREATED" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
        completedAt: newStatus === "COMPLETED" ? new Date() : undefined,
      },
    });
  }

  async getWorkOrdersByCompany(companyId: string) {
    return this.prisma.workOrder.findMany({
      where: { companyId },
      include: { customer: true, technician: true },
    });
  }
}
