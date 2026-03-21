import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { DisputeService } from './dispute.service';
import { CreateDisputeDto, ResolveDisputeDto, DisputeEvidenceDto } from './dto/create-dispute.dto';
import { DisputeQueryDto } from './dto/dispute-query.dto';

@Controller('disputes')
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  create(@Body() dto: CreateDisputeDto) {
    return this.disputeService.create(dto);
  }

  @Get()
  findAll(@Query() query: DisputeQueryDto) {
    return this.disputeService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.disputeService.findOne(id);
  }

  @Post(':id/evidence')
  addEvidence(@Param('id') id: string, @Body() dto: DisputeEvidenceDto) {
    return this.disputeService.addEvidence(id, dto);
  }

  @Post(':id/resolve')
  resolve(@Param('id') id: string, @Body() dto: ResolveDisputeDto) {
    return this.disputeService.resolve(id, dto);
  }
}
