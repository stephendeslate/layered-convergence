// TRACED:AE-AUTH-05 — Auth controller with login, register, profile
// TRACED:AE-SEC-04 — Auth endpoints rate-limited 5/60s via @Throttle
import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async register(@Body() dto: RegisterDto): Promise<{ access_token: string }> {
    return this.authService.register(dto);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(@Body() dto: LoginDto): Promise<{ access_token: string }> {
    return this.authService.login(dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: Record<string, unknown>): Promise<Record<string, unknown>> {
    const user = req.user as { id: string };
    return this.authService.getProfile(user.id);
  }
}
