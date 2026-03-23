import { IsString, IsEmail, MaxLength, IsIn } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@analytics-engine/shared';

// TRACED:AE-SEC-007
export class LoginDto {
  @IsString()
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(255)
  password!: string;
}

// TRACED:AE-SEC-008
export class RegisterDto {
  @IsString()
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(255)
  password!: string;

  @IsString()
  @MaxLength(36)
  tenantId!: string;

  @IsString()
  @MaxLength(20)
  @IsIn([...ALLOWED_REGISTRATION_ROLES])
  role!: string;
}
