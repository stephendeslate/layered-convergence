import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('validate')
  validate(@Body('apiKey') apiKey: string) {
    return this.authService.validateApiKey(apiKey);
  }
}
