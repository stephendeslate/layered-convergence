import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TransactionStatus } from '@prisma/client';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(
    @Request() req: { user: { tenantId: string } },
    @Body() body: { amount: number; currency: string; buyerId: string; sellerId: string; description: string },
  ) {
    return this.transactionService.create({ ...body, tenantId: req.user.tenantId });
  }

  @Get()
  findAll(@Request() req: { user: { tenantId: string } }) {
    return this.transactionService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.transactionService.findOne(id, req.user.tenantId);
  }

  @Post(':id/transition')
  transition(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
    @Body() body: { status: TransactionStatus },
  ) {
    return this.transactionService.transition(id, req.user.tenantId, body.status);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.transactionService.remove(id, req.user.tenantId);
  }
}
