import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UserRole } from '@repo/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

interface RequestWithUser {
  user: { sub: string; email: string; role: string };
}

@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Throttle({ default: { ttl: 60000, limit: 30 } })
  @Post()
  @Roles(UserRole.BUYER)
  create(@Request() req: RequestWithUser, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(req.user.sub, dto);
  }

  @Get()
  findAll(
    @Request() req: RequestWithUser,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.transactionsService.findAll(req.user.sub, req.user.role, {
      status: status as undefined,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  findOne(
    @Request() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.transactionsService.findOne(id, req.user.sub, req.user.role);
  }

  @Post(':id/release')
  @Roles(UserRole.BUYER, UserRole.ADMIN)
  release(
    @Request() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const trigger = req.user.role === UserRole.ADMIN ? 'ADMIN_RELEASED' : 'BUYER_CONFIRMED';
    return this.transactionsService.releaseTransaction(
      id,
      req.user.sub,
      trigger,
      req.user.role === UserRole.ADMIN ? 'Admin released' : 'Buyer confirmed delivery',
    );
  }

  @Post(':id/refund')
  @Roles(UserRole.ADMIN)
  refund(
    @Request() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.transactionsService.refundTransaction(
      id,
      req.user.sub,
      'ADMIN_REFUNDED',
      'Admin refund',
    );
  }
}
