import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, UpdateTransactionStatusDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest {
  user: { sub: string; role: string; tenantId: string; email: string };
}

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.transactionsService.findAll(
      req.user.sub,
      req.user.tenantId,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : undefined,
    );
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
}
