import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsIn,
} from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@analytics-engine/shared';

// TRACED: AE-AUTH-002
export class RegisterDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsString()
  @MaxLength(100)
  name!: string;

  @IsString()
  @MaxLength(50)
  @IsIn(ALLOWED_REGISTRATION_ROLES)
  role!: string;

  @IsString()
  @MaxLength(100)
  tenantSlug!: string;
}

// TRACED: AE-AUTH-003
export class LoginDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
