// TRACED:EM-SEC-05 registration DTO with role validation
import { IsString, IsEmail, MaxLength, MinLength, IsIn } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@em/shared';

export class RegisterDto {
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @IsString()
  @MaxLength(20)
  @IsIn(ALLOWED_REGISTRATION_ROLES as unknown as string[])
  role: string;

  @IsString()
  @MaxLength(36)
  tenantId: string;
}
