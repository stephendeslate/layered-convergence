import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TransactionService } from './transaction.service';

@UseGuards(AuthGuard('jwt'))
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  async findAll(@Request() req: { user: { tenantId: string } }) {
    return this.transactionService.findAll(req.user.tenantId);
  }

  @Post()
  async create(
    @Body() body: { listingId: string; amount: number },
    @Request() req: { user: { tenantId: string; userId: string } },
  ) {
    return this.transactionService.create(body.listingId, body.amount, req.user.tenantId, req.user.userId);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.transactionService.updateStatus(id, body.status, req.user.tenantId);
  }
}
