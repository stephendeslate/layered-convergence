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
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../common/interfaces';

@Controller('disputes')
@UseGuards(JwtAuthGuard)
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateDisputeDto) {
    return this.disputeService.create(req.user.id, req.user.role, dto);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.disputeService.findAll(req.user.id, req.user.role);
  }

  @Get(':id')
  findById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.disputeService.findById(id, req.user.id, req.user.role);
  }

  @Patch(':id/resolve')
  resolve(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.disputeService.resolve(id, req.user.id, req.user.role, dto);
  }
}
