import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DisputeService } from './dispute.service.js';
import { CreateDisputeDto } from './dto/create-dispute.dto.js';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto.js';
import { AuthGuard } from '../common/guards/auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { User } from '../../generated/prisma/client.js';

@Controller('disputes')
@UseGuards(AuthGuard)
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  create(@Body() dto: CreateDisputeDto, @CurrentUser() user: User) {
    return this.disputeService.create(dto, user);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.disputeService.findById(id);
  }

  @Post(':id/resolve')
  resolve(
    @Param('id') id: string,
    @Body() dto: ResolveDisputeDto,
    @CurrentUser() user: User,
  ) {
    return this.disputeService.resolve(id, dto, user);
  }
}
