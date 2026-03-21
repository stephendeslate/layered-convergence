import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DisputeService } from './dispute.service';

@Controller('disputes')
@UseGuards(JwtAuthGuard)
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Get()
  findAll(@Request() req: { user: { userId: string } }) {
    return this.disputeService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { userId: string } }) {
    return this.disputeService.findOne(id, req.user.userId);
  }

  @Post()
  create(
    @Body() body: { transactionId: string; reason: string },
    @Request() req: { user: { userId: string } },
  ) {
    return this.disputeService.create({ ...body, filedById: req.user.userId });
  }

  @Patch(':id/transition')
  transition(
    @Param('id') id: string,
    @Body() body: { status: string; resolution?: string },
    @Request() req: { user: { userId: string } },
  ) {
    return this.disputeService.transition(id, req.user.userId, body.status, body.resolution);
  }
}
