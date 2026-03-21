import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto, ResolveDisputeDto } from './dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('disputes')
@UseGuards(RolesGuard)
export class DisputesController {
  constructor(private disputesService: DisputesService) {}

  @Post()
  @Roles(UserRole.BUYER)
  create(
    @Body() dto: CreateDisputeDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.disputesService.create(userId, tenantId, dto);
  }

  @Get()
  findAll(@CurrentUser('tenantId') tenantId: string) {
    return this.disputesService.findAll(tenantId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.disputesService.findOne(id, tenantId);
  }

  @Patch(':id/resolve')
  @Roles(UserRole.ADMIN)
  resolve(
    @Param('id') id: string,
    @Body() dto: ResolveDisputeDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.disputesService.resolve(id, tenantId, dto, userId);
  }

  @Patch(':id/evidence')
  submitEvidence(
    @Param('id') id: string,
    @Body('evidence') evidence: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.disputesService.submitEvidence(id, tenantId, evidence);
  }
}
