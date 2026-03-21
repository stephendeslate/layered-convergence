import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest {
  user: { userId: string; email: string; role: string };
}

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async create(@Request() req: AuthenticatedRequest, @Body() dto: CreateTransactionDto) {
    return this.transactionService.create(req.user.userId, dto);
  }

  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    return this.transactionService.findAll(req.user.userId);
  }

  @Get(':id')
  async findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.transactionService.findOne(req.user.userId, id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionStatusDto,
  ) {
    return this.transactionService.updateStatus(req.user.userId, id, dto);
  }
}
