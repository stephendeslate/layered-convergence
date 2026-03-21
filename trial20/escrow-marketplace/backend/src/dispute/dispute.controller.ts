import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DisputeService } from './dispute.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';

@Controller('disputes')
@UseGuards(AuthGuard('jwt'))
export class DisputeController {
  constructor(private disputeService: DisputeService) {}

  @Post()
  create(@Request() req: { user: { id: string; role: string } }, @Body() dto: CreateDisputeDto) {
    return this.disputeService.create(req.user.id, req.user.role, dto);
  }

  @Get()
  findAll(@Request() req: { user: { id: string } }) {
    return this.disputeService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.disputeService.findOne(req.user.id, id);
  }

  @Patch(':id/resolve')
  resolve(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.disputeService.resolve(req.user.id, id, dto);
  }
}
