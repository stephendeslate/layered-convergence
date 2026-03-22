// TRACED: EM-AUTH-004 — Registration DTO with role validation
import { IsString, IsEmail, IsIn, MaxLength, MinLength } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@escrow-marketplace/shared';

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
  @MaxLength(20)
  @IsIn(ALLOWED_REGISTRATION_ROLES)
  role!: string;

  @IsString()
  @MaxLength(36)
  tenantId!: string;
}
