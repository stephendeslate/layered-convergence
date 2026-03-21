import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WorkOrderService } from './workorder.service';

@UseGuards(AuthGuard('jwt'))
@Controller('workorders')
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Get()
  async findAll(@Request() req: { user: { tenantId: string } }) {
    return this.workOrderService.findAll(req.user.tenantId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.workOrderService.findOne(id, req.user.tenantId);
  }

  @Post()
  async create(
    @Body() body: { title: string; description?: string; priority?: string },
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.workOrderService.create(body.title, body.description, body.priority, req.user.tenantId);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.workOrderService.updateStatus(id, body.status, req.user.tenantId);
  }
}
