import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { DisputeService } from './dispute.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { SubmitEvidenceDto } from './dto/submit-evidence.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/auth.service';

@Controller('disputes')
@UseGuards(AuthGuard)
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  async create(@Body() dto: CreateDisputeDto, @CurrentUser() user: JwtPayload) {
    return this.disputeService.create(dto, user);
  }

  @Get()
  async findAll(@CurrentUser() user: JwtPayload) {
    return this.disputeService.findAll(user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.disputeService.findOne(id, user);
  }

  @Post(':id/evidence')
  async submitEvidence(
    @Param('id') id: string,
    @Body() dto: SubmitEvidenceDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.disputeService.submitEvidence(id, dto, user);
  }

  @Patch(':id/resolve')
  async resolve(
    @Param('id') id: string,
    @Body() dto: ResolveDisputeDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.disputeService.resolve(id, dto, user);
  }
}
