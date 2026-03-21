import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { DisputeService } from './dispute.service.js';
import { UpdateEvidenceDto } from './dto/update-evidence.dto.js';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { User } from '../../generated/prisma/client.js';

@Controller('disputes')
@UseGuards(AuthGuard)
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.disputeService.findById(id);
  }

  @Patch(':id/evidence')
  async updateEvidence(@Param('id') id: string, @Body() dto: UpdateEvidenceDto) {
    return this.disputeService.updateEvidence(id, dto.evidence);
  }

  @Patch(':id/resolve')
  async resolve(
    @Param('id') id: string,
    @Body() dto: ResolveDisputeDto,
    @CurrentUser() user: User,
  ) {
    return this.disputeService.resolve(id, dto.resolution, user);
  }
}
