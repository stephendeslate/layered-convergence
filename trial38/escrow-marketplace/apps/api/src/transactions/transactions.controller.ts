import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { clampPageSize } from '@escrow-marketplace/shared';

interface AuthenticatedRequest {
  user: { sub: string; role: string; tenantId: string; email: string };
}

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  // TRACED: EM-PERF-004 — Cache-Control headers on transaction list endpoint
  @Get()
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    const clampedPageSize = clampPageSize(
      pageSize ? parseInt(pageSize, 10) : 20,
    );
    res?.setHeader('Cache-Control', 'private, max-age=15, stale-while-revalidate=30');
    return this.transactionsService.findAll(
      req.user.sub,
      req.user.tenantId,
      page ? parseInt(page, 10) : 1,
      clampedPageSize,
    );
  }

  // TRACED: EM-API-011 — Transaction lookup with tenant/participant validation
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.transactionsService.findOne(id, req.user);
  }

  @Post()
  create(
    @Body() dto: CreateTransactionDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.transactionsService.create(dto, req.user);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionStatusDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.transactionsService.updateStatus(id, dto, req.user);
  }

  // TRACED: EM-API-012 — Transaction cancellation with tenant/participant validation
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.transactionsService.remove(id, req.user);
  }
}
