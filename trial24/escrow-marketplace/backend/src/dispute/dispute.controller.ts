import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { DisputeService } from './dispute.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest {
  user: { userId: string; email: string; role: string };
}

@Controller('disputes')
@UseGuards(JwtAuthGuard)
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  async create(@Request() req: AuthenticatedRequest, @Body() dto: CreateDisputeDto) {
    return this.disputeService.create(req.user.userId, dto);
  }

  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    return this.disputeService.findAll(req.user.userId);
  }

  @Get(':id')
  async findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.disputeService.findOne(req.user.userId, id);
  }

  @Patch(':id/resolve')
  async resolve(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.disputeService.resolve(req.user.userId, id);
  }
}
