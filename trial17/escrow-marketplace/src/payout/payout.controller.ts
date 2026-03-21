import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PayoutService } from './payout.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('payouts')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Post()
  async create(
    @Body() dto: CreatePayoutDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.payoutService.create(dto, user);
  }

  @Get()
  async findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.payoutService.findAll(user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.payoutService.findOne(id);
  }
}
