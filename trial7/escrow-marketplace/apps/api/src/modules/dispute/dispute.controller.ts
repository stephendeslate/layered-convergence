import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { DisputeService } from './dispute.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { UserId } from '../../common/decorators/user-id.decorator';

@Controller('disputes')
@UseGuards(AuthGuard)
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  create(@UserId() userId: string, @Body() dto: CreateDisputeDto) {
    return this.disputeService.create(userId, dto);
  }

  @Get()
  findAll() {
    return this.disputeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.disputeService.findOneOrThrow(id);
  }

  @Post(':id/resolve')
  resolve(@Param('id') id: string, @Body() dto: ResolveDisputeDto) {
    return this.disputeService.resolve(id, dto);
  }
}
