import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { PrismaExceptionFilter } from '../common/filters/prisma-exception.filter';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('payouts')
@UseFilters(PrismaExceptionFilter)
@UseGuards(RolesGuard)
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Post()
  @Roles('PROVIDER')
  create(@Request() req: any, @Body() dto: CreatePayoutDto) {
    return this.payoutsService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.payoutsService.findAll(req.user.id, req.user.role);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.payoutsService.findById(id);
  }

  @Patch(':id/process')
  @Roles('ADMIN')
  process(@Param('id') id: string) {
    return this.payoutsService.updateStatus(id, 'PROCESSING' as any);
  }

  @Patch(':id/complete')
  @Roles('ADMIN')
  complete(@Param('id') id: string) {
    return this.payoutsService.updateStatus(id, 'COMPLETED' as any);
  }
}
