import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: { id: string; email: string; role: string; tenantId: string };
}

// TRACED: AE-API-001
@Controller('auth')
@Throttle({ default: { ttl: 60000, limit: 5 } })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // TRACED: AE-AUTH-007
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: AuthenticatedRequest) {
    return this.authService.validateUser(req.user.id);
  }
}
