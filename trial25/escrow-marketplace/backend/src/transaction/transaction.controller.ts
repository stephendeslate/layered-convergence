import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TransactionService } from './transaction.service';

// [TRACED:API-007] JwtAuthGuard on all protected endpoints
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  findAll(@Request() req: { user: { userId: string } }) {
    return this.transactionService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { userId: string } }) {
    return this.transactionService.findOne(id, req.user.userId);
  }

  @Post()
  create(
    @Body() body: { sellerId: string; amount: number; description?: string; currency?: string },
    @Request() req: { user: { userId: string } },
  ) {
    return this.transactionService.create({ ...body, buyerId: req.user.userId });
  }

  @Patch(':id/transition')
  transition(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Request() req: { user: { userId: string } },
  ) {
    return this.transactionService.transition(id, req.user.userId, body.status);
  }
}
