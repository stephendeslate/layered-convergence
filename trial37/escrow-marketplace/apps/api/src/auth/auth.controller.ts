import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // TRACED: EM-SEC-002 — Auth rate limiting (5/min)
  @Post('register')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // TRACED: EM-AUTH-004 — JwtAuthGuard on protected routes
  // TRACED: EM-API-001 — JWT Bearer authentication on protected routes
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: { user: { sub: string } }) {
    return this.authService.getProfile(req.user.sub);
  }

  @Get('/health')
  // TRACED: EM-API-005 — Health check endpoint
  // TRACED: EM-INFRA-003 — HEALTHCHECK target in Dockerfile
  health() {
    return { status: 'ok' };
  }
}
