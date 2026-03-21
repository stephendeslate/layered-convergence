// [TRACED:FD-024] WorkOrder creation endpoint
import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { WorkOrderService } from "./work-order.service";

@Controller("work-orders")
@UseGuards(AuthGuard("jwt"))
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Post()
  create(@Body() body: { title: string; description?: string; customerId: string; companyId: string; priority?: number }) {
    return this.workOrderService.createWorkOrder(body);
  }

  @Post(":id/assign")
  assign(@Param("id") id: string, @Body() body: { technicianId: string }) {
    return this.workOrderService.assignTechnician(id, body.technicianId);
  }

  @Post(":id/transition")
  transition(@Param("id") id: string, @Body() body: { status: string }) {
    return this.workOrderService.transitionWorkOrder(id, body.status);
  }

  @Get("company/:companyId")
  getByCompany(@Param("companyId") companyId: string) {
    return this.workOrderService.getWorkOrdersByCompany(companyId);
  }
}
