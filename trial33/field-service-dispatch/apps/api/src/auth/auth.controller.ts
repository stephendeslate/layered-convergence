import { Controller, Post, Body } from '@nestjs/common';
import { IsEmail, IsString, MinLength, IsIn } from 'class-validator';
import { AuthService } from './auth.service';
import { ROLES } from '@field-service-dispatch/shared';

// TRACED: FD-AUTH-NOREG-002 — Registration DTO excludes ADMIN
class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsIn(['DISPATCHER', 'TECHNICIAN', 'CUSTOMER'])
  role!: string;

  @IsString()
  tenantId!: string;
}

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.role, dto.tenantId);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }
}
