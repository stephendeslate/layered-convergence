// TRACED: EM-TXN-002 — Transactions REST controller
import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  async create(
    @Request() req: { user: { sub: string; tenantId: string } },
    @Body() body: { listingId: string; amount: string },
  ) {
    return this.transactionsService.create(req.user.tenantId, req.user.sub, body);
  }

  @Get()
  async findAll(
    @Request() req: { user: { tenantId: string } },
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.transactionsService.findAll(
      req.user.tenantId,
      Number(page) || 1,
      Number(pageSize) || 20,
    );
  }

  @Patch(':id/status')
  async updateStatus(
    @Request() req: { user: { tenantId: string } },
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.transactionsService.updateStatus(req.user.tenantId, id, body.status);
  }
}
