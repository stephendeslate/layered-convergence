import { Controller, Get, Post, Patch, Param, Query, Body } from '@nestjs/common';
import { DisputeService } from './dispute.service';

@Controller('disputes')
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Get()
  findByTransaction(@Query('transactionId') transactionId: string) {
    return this.disputeService.findAllByTransaction(transactionId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.disputeService.findById(id);
  }

  @Post()
  create(
    @Body()
    body: {
      reason: string;
      transactionId: string;
      arbiterId?: string;
    },
  ) {
    return this.disputeService.create(body);
  }

  @Patch(':id/status')
  transitionStatus(
    @Param('id') id: string,
    @Body() body: { status: string; resolution?: string },
  ) {
    return this.disputeService.transitionStatus(id, body.status, body.resolution);
  }
}
