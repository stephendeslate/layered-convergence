// TRACED: EM-API-010 — Transactions controller with full CRUD
// TRACED: EM-PERF-007 — Cache-Control private for transaction endpoints
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import { normalizePageParams, DEFAULT_PAGE_SIZE } from '@escrow-marketplace/shared';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(dto);
  }

  @Get()
  async findAll(
    @Query('tenantId') tenantId: string,
    @Query('page') rawPage: string,
    @Query('pageSize') rawPageSize: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { page, pageSize } = normalizePageParams(
      parseInt(rawPage, 10) || 1,
      parseInt(rawPageSize, 10) || DEFAULT_PAGE_SIZE,
    );

    res.setHeader('Cache-Control', 'private, max-age=10');

    return this.transactionsService.findAll(tenantId, page, pageSize);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.transactionsService.findOne(id, tenantId);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
    @Body() dto: UpdateTransactionStatusDto,
  ) {
    return this.transactionsService.updateStatus(id, tenantId, dto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.transactionsService.remove(id, tenantId);
  }
}
