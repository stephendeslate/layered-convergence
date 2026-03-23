// TRACED: FD-REGISTER-DTO
import { IsEmail, IsString, MinLength, MaxLength, IsIn } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@field-service-dispatch/shared';

export class RegisterDto {
  @IsString()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  // TRACED: FD-ROLE-RESTRICTION
  @IsString()
  @MaxLength(20)
  @IsIn(ALLOWED_REGISTRATION_ROLES as unknown as string[])
  role: string;

  @IsString()
  @MaxLength(36)
  tenantId: string;
}
