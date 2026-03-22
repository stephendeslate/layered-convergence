import { IsEmail, IsString, MaxLength, MinLength, IsIn } from 'class-validator';
// TRACED: FD-REGISTER-DTO
import { ALLOWED_REGISTRATION_ROLES } from '@field-service-dispatch/shared';

export class RegisterDto {
  @IsEmail()
  @IsString()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsString()
  @MaxLength(20)
  @IsIn([...ALLOWED_REGISTRATION_ROLES])
  role!: string;

  @IsString()
  @MaxLength(36)
  tenantId!: string;
}
