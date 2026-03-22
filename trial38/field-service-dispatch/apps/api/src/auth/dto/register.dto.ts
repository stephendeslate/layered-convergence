// TRACED: FD-AUTH-004 — Registration DTO with role validation excluding ADMIN
// TRACED: FD-SEC-004 — Input validation with length constraints
import { IsEmail, IsString, MinLength, MaxLength, IsIn, IsUUID } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@field-service-dispatch/shared';

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
  @IsIn(ALLOWED_REGISTRATION_ROLES)
  role: string;

  @IsUUID()
  @MaxLength(36)
  tenantId: string;
}
