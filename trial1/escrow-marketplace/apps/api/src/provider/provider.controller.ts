import {
  Controller,
  Post,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProviderService } from './provider.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('providers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Post('onboard')
  @Roles('PROVIDER')
  async startOnboarding(@CurrentUser() user: CurrentUserData) {
    return this.providerService.initiateOnboarding(user.id, user.email);
  }

  @Get('status')
  @Roles('PROVIDER')
  async getOnboardingStatus(@CurrentUser() user: CurrentUserData) {
    return this.providerService.getOnboardingStatus(user.id);
  }

  @Get('dashboard')
  @Roles('PROVIDER')
  async getDashboard(@CurrentUser() user: CurrentUserData) {
    return this.providerService.getDashboard(user.id);
  }

  @Post('onboard/refresh')
  @Roles('PROVIDER')
  @HttpCode(HttpStatus.OK)
  async refreshOnboardingLink(@CurrentUser() user: CurrentUserData) {
    return this.providerService.refreshOnboardingLink(user.id);
  }
}
