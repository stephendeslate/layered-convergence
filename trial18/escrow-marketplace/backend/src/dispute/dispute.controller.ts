import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { DisputeService } from './dispute.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../common/interfaces';

@Controller('disputes')
@UseGuards(JwtAuthGuard)
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateDisputeDto,
  ) {
    return this.disputeService.create(req.user.userId, req.user.role, dto);
  }

  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    return this.disputeService.findAll(req.user.userId, req.user.role);
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.disputeService.findById(id, req.user.userId, req.user.role);
  }

  @Patch(':id/resolve')
  async resolve(
    @Param('id') id: string,
    @Body('resolution') resolution: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.disputeService.resolve(id, resolution, req.user.userId, req.user.role);
  }
}
