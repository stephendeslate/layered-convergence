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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DisputeService } from './dispute.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';

@Controller('disputes')
@UseGuards(JwtAuthGuard)
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  create(
    @Body() dto: CreateDisputeDto,
    @Request() req: { user: { userId: string } },
  ) {
    return this.disputeService.create(dto, req.user.userId);
  }

  @Get()
  findAll(@Request() req: { user: { userId: string } }) {
    return this.disputeService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.disputeService.findOne(id, req.user.userId);
  }

  @Patch(':id/resolve')
  resolve(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.disputeService.resolve(id, req.user.userId);
  }
}
