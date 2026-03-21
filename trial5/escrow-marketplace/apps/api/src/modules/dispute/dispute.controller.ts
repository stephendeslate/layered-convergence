import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { DisputeService } from './dispute.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';

@Controller('disputes')
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  create(@Body() dto: CreateDisputeDto) {
    return this.disputeService.create(dto);
  }

  @Get()
  findAll() {
    return this.disputeService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.disputeService.findById(id);
  }

  @Post(':id/evidence')
  submitEvidence(
    @Param('id') id: string,
    @Body() body: { evidence: Record<string, unknown> },
  ) {
    return this.disputeService.submitEvidence(id, body.evidence);
  }

  @Post(':id/resolve')
  resolve(@Param('id') id: string, @Body() dto: ResolveDisputeDto) {
    return this.disputeService.resolve(id, dto);
  }
}
