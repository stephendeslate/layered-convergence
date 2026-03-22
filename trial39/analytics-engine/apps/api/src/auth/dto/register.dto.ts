// TRACED:AE-AUTH-05 — RegisterDto with @IsIn excluding ADMIN

import { IsString, IsEmail, MaxLength, IsIn } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@analytics-engine/shared';

export class RegisterDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(128)
  password!: string;

  @IsString()
  @MaxLength(150)
  displayName!: string;

  @IsString()
  @MaxLength(20)
  @IsIn([...ALLOWED_REGISTRATION_ROLES])
  role!: string;

  @IsString()
  @MaxLength(36)
  tenantId!: string;
}
