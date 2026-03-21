import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ConnectedAccountService } from './connected-account.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('connected-accounts')
@UseGuards(AuthGuard)
export class ConnectedAccountController {
  constructor(private readonly connectedAccountService: ConnectedAccountService) {}

  @Post('onboard')
  createOnboarding(@CurrentUser() user: { id: string }) {
    return this.connectedAccountService.createOnboardingLink(user.id);
  }

  @Get('me')
  findMine(@CurrentUser() user: { id: string }) {
    return this.connectedAccountService.findByUser(user.id);
  }

  @Get()
  findAll() {
    return this.connectedAccountService.findAll();
  }

  @Get(':userId')
  findByUser(@Param('userId') userId: string) {
    return this.connectedAccountService.findByUser(userId);
  }
}
