// TRACED:AE-AUTH-02 — Register DTO with @IsIn(ALLOWED_REGISTRATION_ROLES)
import { IsEmail, IsString, MaxLength, MinLength, IsIn } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@analytics-engine/shared';

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
  name: string;

  @IsString()
  @MaxLength(36)
  @IsIn([...ALLOWED_REGISTRATION_ROLES])
  role: string;

  @IsString()
  @MaxLength(36)
  tenantId: string;
}
