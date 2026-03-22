// TRACED: FD-AUTH-002 — Auth controller with rate-limited login/register
import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { JwtAuthGuard } from './jwt.strategy';

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

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req: { user: { sub: string; tenantId: string } }) {
    return this.authService.findById(req.user.sub);
  }
}
