import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DisputeService } from './dispute.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('disputes')
@UseGuards(AuthGuard)
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateDisputeDto,
  ) {
    return this.disputeService.create(user.id, dto);
  }

  @Get()
  findAll(
    @Query('transactionId') transactionId?: string,
    @Query('status') status?: string,
  ) {
    return this.disputeService.findAll({ transactionId, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.disputeService.findOne(id);
  }

  @Post(':id/resolve')
  resolve(@Param('id') id: string, @Body() dto: ResolveDisputeDto) {
    return this.disputeService.resolve(id, dto);
  }

  @Post(':id/evidence')
  addEvidence(
    @Param('id') id: string,
    @Body() body: { evidence: Record<string, unknown>[] },
  ) {
    return this.disputeService.addEvidence(id, body.evidence);
  }
}
