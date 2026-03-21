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
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { PrismaExceptionFilter } from '../common/filters/prisma-exception.filter';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('transactions')
@UseFilters(PrismaExceptionFilter)
@UseGuards(RolesGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @Roles('BUYER')
  create(@Request() req: any, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.transactionsService.findAll(req.user.id, req.user.role);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.transactionsService.findById(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @Request() req: any,
  ) {
    return this.transactionsService.updateStatus(
      id,
      dto.status,
      dto.reason,
      req.user.id,
    );
  }

  @Get(':id/history')
  getStatusHistory(@Param('id') id: string) {
    return this.transactionsService.getStatusHistory(id);
  }
}
