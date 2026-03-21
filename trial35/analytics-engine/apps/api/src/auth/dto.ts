// TRACED: AE-AUTH-004 — DTOs with role validation excluding ADMIN
import { IsEmail, IsString, MinLength, IsIn, IsUUID } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsIn(['MANAGER', 'ANALYST', 'VIEWER'], { message: 'ADMIN role cannot be self-assigned' })
  role: string;

  @IsUUID()
  tenantId: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsUUID()
  tenantId: string;
}
