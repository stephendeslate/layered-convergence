import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TransactionStatus } from '@prisma/client';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransitionDto } from './dto/transition.dto';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('transactions')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async create(
    @Body() dto: CreateTransactionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.transactionService.create(dto, user);
  }

  @Get()
  async findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query('status') status?: TransactionStatus,
  ) {
    return this.transactionService.findAll(user, status);
  }

  @Get('status-counts')
  async getStatusCounts(@CurrentUser() user: CurrentUserPayload) {
    return this.transactionService.getStatusCounts(user.sub, user.role);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.transactionService.findOneWithAccess(id, user);
  }

  @Patch(':id/transition')
  async transition(
    @Param('id') id: string,
    @Body() dto: TransitionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.transactionService.transition(id, dto.action, user);
  }
}
