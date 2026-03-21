import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ConnectedAccountService } from './connected-account.service';
import { CreateConnectedAccountDto } from './dto/create-connected-account.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { UserId } from '../../common/decorators/user-id.decorator';

@Controller('connected-accounts')
@UseGuards(AuthGuard)
export class ConnectedAccountController {
  constructor(
    private readonly connectedAccountService: ConnectedAccountService,
  ) {}

  @Post()
  create(@UserId() userId: string, @Body() dto: CreateConnectedAccountDto) {
    return this.connectedAccountService.create(userId, dto);
  }

  @Get('me')
  findMine(@UserId() userId: string) {
    return this.connectedAccountService.findByUser(userId);
  }

  @Get('onboarding-url')
  getOnboardingUrl(@UserId() userId: string) {
    return this.connectedAccountService.getOnboardingUrl(userId);
  }
}
