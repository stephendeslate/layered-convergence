// TRACED: EM-ADTO-001
import { IsEmail, IsString, MaxLength, IsIn } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@escrow-marketplace/shared';

export class RegisterDto {
  @IsString()
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(255)
  password!: string;

  @IsString()
  @MaxLength(100)
  name!: string;

  @IsString()
  @MaxLength(20)
  @IsIn([...ALLOWED_REGISTRATION_ROLES])
  role!: string;

  @IsString()
  @MaxLength(36)
  tenantId!: string;
}

export class LoginDto {
  @IsString()
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(255)
  password!: string;
}
