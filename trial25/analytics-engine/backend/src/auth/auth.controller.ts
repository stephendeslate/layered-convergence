import { Body, Controller, Post, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

// [TRACED:API-001] Auth endpoints for registration and login
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Headers('x-tenant-id') tenantId: string,
  ): Promise<{ accessToken: string }> {
    return this.authService.register(dto, tenantId);
  }

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<{ accessToken: string }> {
    return this.authService.login(dto);
  }
}
