import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { DisputeService } from './dispute.service.js';
import { SubmitEvidenceDto } from './dto/submit-evidence.dto.js';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto.js';
import { AuthGuard } from '../common/guards/auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { User } from '../../generated/prisma/client.js';

@Controller('disputes')
@UseGuards(AuthGuard)
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.disputeService.findById(id);
  }

  @Get('transaction/:transactionId')
  findByTransactionId(@Param('transactionId') transactionId: string) {
    return this.disputeService.findByTransactionId(transactionId);
  }

  @Patch(':id/evidence')
  submitEvidence(
    @Param('id') id: string,
    @Body() dto: SubmitEvidenceDto,
  ) {
    return this.disputeService.submitEvidence(id, dto.evidence);
  }

  @Patch(':id/resolve')
  resolve(
    @Param('id') id: string,
    @Body() dto: ResolveDisputeDto,
    @CurrentUser() user: User,
  ) {
    return this.disputeService.resolve(id, dto, user);
  }
}
