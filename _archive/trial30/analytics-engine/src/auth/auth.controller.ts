import { Controller, Post, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('validate')
  async validate(@Headers('x-api-key') apiKey: string) {
    const tenant = await this.authService.validateApiKey(apiKey);
    return { valid: true, tenantId: tenant.id, tenantName: tenant.name };
  }
}
