import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { DisputeService } from './dispute.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { SubmitEvidenceDto } from './dto/submit-evidence.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../common/decorators/current-user.decorator';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';

@Controller('disputes')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  @Roles(Role.BUYER, Role.SELLER)
  async create(
    @Body() dto: CreateDisputeDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.disputeService.create(dto, user);
  }

  @Get()
  async findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.disputeService.findAll(user);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.disputeService.findOneWithAccess(id, user);
  }

  @Patch(':id/evidence')
  @Roles(Role.BUYER, Role.SELLER)
  async submitEvidence(
    @Param('id') id: string,
    @Body() dto: SubmitEvidenceDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.disputeService.submitEvidence(id, dto, user);
  }

  @Patch(':id/resolve')
  @Roles(Role.ADMIN)
  async resolve(
    @Param('id') id: string,
    @Body() dto: ResolveDisputeDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.disputeService.resolve(id, dto, user);
  }
}
