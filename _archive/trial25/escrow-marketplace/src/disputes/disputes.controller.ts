import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { DisputeStatus, UserRole } from '@prisma/client';

@Controller('disputes')
@UseGuards(AuthGuard, RolesGuard)
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post()
  @Roles(UserRole.BUYER)
  create(@Body() dto: CreateDisputeDto, @CurrentUser() user: RequestUser) {
    return this.disputesService.create(dto, user.sub);
  }

  @Get()
  findAll(
    @Query('transactionId') transactionId?: string,
    @Query('status') status?: DisputeStatus,
  ) {
    return this.disputesService.findAll({ transactionId, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.disputesService.findById(id);
  }

  @Patch(':id/resolve')
  @Roles(UserRole.ADMIN)
  resolve(
    @Param('id') id: string,
    @Body() dto: ResolveDisputeDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.disputesService.resolve(id, dto, user.sub);
  }
}
