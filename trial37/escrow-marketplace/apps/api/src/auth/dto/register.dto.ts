import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@escrow-marketplace/shared';

// TRACED: EM-SEC-004 — Input validation with MaxLength on all DTO strings
// TRACED: EM-AUTH-005 — Password length validation (8-128)

export class RegisterDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsString()
  @MaxLength(50)
  @IsIn(ALLOWED_REGISTRATION_ROLES)
  role!: string;

  @IsUUID()
  @MaxLength(36)
  tenantId!: string;
}
