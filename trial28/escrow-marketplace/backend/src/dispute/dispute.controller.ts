import { Controller, Get, Patch, Param, Query } from '@nestjs/common';
import { DisputeService } from './dispute.service';

@Controller('disputes')
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Get()
  async findAll() {
    return this.disputeService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.disputeService.findById(id);
  }

  @Patch(':id/status')
  async transition(
    @Param('id') id: string,
    @Query('status') status: string,
  ) {
    return this.disputeService.transitionStatus(id, status);
  }
}
