// [TRACED:FD-008] Work order REST API endpoints
// [TRACED:FD-022] API contract for work order operations
import { Controller, Post, Get, Patch, Body, Param, UseGuards, Request } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { WorkOrderService } from "./work-order.service";

@Controller("work-orders")
@UseGuards(AuthGuard("jwt"))
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Post()
  create(
    @Body()
    body: {
      title: string;
      description: string;
      priority: number;
      customerId: string;
      estimatedCost?: number;
    },
    @Request() req: { user: { userId: string; companyId: string } },
  ) {
    return this.workOrderService.create({
      ...body,
      companyId: req.user.companyId,
    });
  }

  @Patch(":id/transition")
  transition(
    @Param("id") id: string,
    @Body() body: { status: string },
    @Request() req: { user: { companyId: string } },
  ) {
    return this.workOrderService.transition(id, body.status, req.user.companyId);
  }

  @Patch(":id/assign")
  assign(
    @Param("id") id: string,
    @Body() body: { technicianId: string },
    @Request() req: { user: { companyId: string } },
  ) {
    return this.workOrderService.assign(id, body.technicianId, req.user.companyId);
  }

  @Get()
  findAll(@Request() req: { user: { companyId: string } }) {
    return this.workOrderService.findByCompany(req.user.companyId);
  }
}
