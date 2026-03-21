import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../common/interfaces';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateTransactionDto) {
    return this.transactionService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.transactionService.findAll(req.user.id, req.user.role);
  }

  @Get(':id')
  findById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.transactionService.findById(id, req.user.id, req.user.role);
  }

  @Patch(':id/status')
  updateStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.transactionService.updateStatus(
      id,
      dto.status,
      req.user.id,
      req.user.role,
    );
  }
}
