// TRACED: FD-AUTH-004 — DTOs with role validation excluding ADMIN
// TRACED: FD-SEC-004 — Input validation with length constraints
import { IsEmail, IsString, MinLength, MaxLength, IsIn, IsUUID } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @IsString()
  @MaxLength(100)
  @IsIn(['DISPATCHER', 'TECHNICIAN', 'VIEWER'], { message: 'ADMIN role cannot be self-assigned' })
  role: string;

  @IsUUID()
  tenantId: string;
}

export class LoginDto {
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @IsUUID()
  tenantId: string;
}
