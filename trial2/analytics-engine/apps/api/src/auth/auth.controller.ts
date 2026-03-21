import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ValidateKeyDto } from './dto/validate-key.dto';

@Controller('api/v1/auth')
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 10, ttl: 60000 } })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.slug, loginDto.apiKey);
  }

  @Post('validate-key')
  async validateKey(@Body() dto: ValidateKeyDto) {
    const result = await this.authService.validateApiKey(dto.apiKey);
    if (!result) {
      return { valid: false };
    }
    return { valid: true, tenantId: result.tenantId, tenantName: result.tenantName };
  }
}
