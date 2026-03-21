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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(
    @Body() dto: CreateTransactionDto,
    @Request() req: { user: { userId: string } },
  ) {
    return this.transactionService.create(dto, req.user.userId);
  }

  @Get()
  findAll(@Request() req: { user: { userId: string } }) {
    return this.transactionService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.transactionService.findOne(id, req.user.userId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @Request() req: { user: { userId: string } },
  ) {
    return this.transactionService.updateStatus(id, dto.status, req.user.userId);
  }
}
