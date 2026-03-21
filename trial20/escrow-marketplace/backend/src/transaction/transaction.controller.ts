import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';

@Controller('transactions')
@UseGuards(AuthGuard('jwt'))
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Post()
  create(@Request() req: { user: { id: string; role: string } }, @Body() dto: CreateTransactionDto) {
    return this.transactionService.create(req.user.id, req.user.role, dto);
  }

  @Get()
  findAll(@Request() req: { user: { id: string } }) {
    return this.transactionService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.transactionService.findOne(req.user.id, id);
  }

  @Patch(':id/status')
  updateStatus(
    @Request() req: { user: { id: string; role: string } },
    @Param('id') id: string,
    @Body() dto: UpdateTransactionStatusDto,
  ) {
    return this.transactionService.updateStatus(
      req.user.id,
      req.user.role,
      id,
      dto,
    );
  }
}
