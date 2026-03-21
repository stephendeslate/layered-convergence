import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DisputeService } from './dispute.service';
import { CreateDisputeDto, ResolveDisputeDto } from './dispute.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUserId } from '../../common/decorators/current-user.decorator';

@Controller('disputes')
@UseGuards(AuthGuard)
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  create(@CurrentUserId() userId: string, @Body() dto: CreateDisputeDto) {
    return this.disputeService.create(userId, dto);
  }

  @Get()
  findAll(
    @Query('transactionId') transactionId?: string,
    @Query('status') status?: string,
  ) {
    return this.disputeService.findAll({ transactionId, status });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.disputeService.findById(id);
  }

  @Post(':id/resolve')
  resolve(@Param('id') id: string, @Body() dto: ResolveDisputeDto) {
    return this.disputeService.resolve(id, dto);
  }

  @Post(':id/evidence')
  addEvidence(@Param('id') id: string, @Body() evidence: Record<string, unknown>) {
    return this.disputeService.addEvidence(id, evidence);
  }
}
