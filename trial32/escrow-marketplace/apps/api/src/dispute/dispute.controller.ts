import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { DisputeService } from './dispute.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DisputeStatus } from '@prisma/client';

@Controller('disputes')
@UseGuards(JwtAuthGuard)
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  create(
    @Request() req: { user: { id: string; tenantId: string } },
    @Body() body: { reason: string; transactionId: string },
  ) {
    return this.disputeService.create({ ...body, filedById: req.user.id, tenantId: req.user.tenantId });
  }

  @Get()
  findAll(@Request() req: { user: { tenantId: string } }) {
    return this.disputeService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.disputeService.findOne(id, req.user.tenantId);
  }

  @Post(':id/transition')
  transition(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
    @Body() body: { status: DisputeStatus; resolution?: string },
  ) {
    return this.disputeService.transition(id, req.user.tenantId, body.status, body.resolution);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.disputeService.remove(id, req.user.tenantId);
  }
}
