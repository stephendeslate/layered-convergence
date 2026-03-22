// TRACED: FD-AUTH-001 — Register DTO with validation constraints
import { IsString, IsEmail, MinLength, MaxLength, IsIn } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@field-service-dispatch/shared';

export class RegisterDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsString()
  @MaxLength(20)
  @IsIn(ALLOWED_REGISTRATION_ROLES)
  role!: string;

  @IsString()
  @MaxLength(36)
  tenantId!: string;
}
