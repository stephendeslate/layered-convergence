// TRACED:AE-AUTH-REGISTER-DTO
import { IsString, IsEmail, MaxLength, IsIn } from 'class-validator';
import {
  ALLOWED_REGISTRATION_ROLES,
  NAME_MAX_LENGTH,
  UUID_MAX_LENGTH,
  SHORT_STRING_MAX_LENGTH,
} from '@analytics-engine/shared';

export class RegisterDto {
  @IsString()
  @IsEmail()
  @MaxLength(NAME_MAX_LENGTH)
  email!: string;

  @IsString()
  @MaxLength(SHORT_STRING_MAX_LENGTH)
  password!: string;

  @IsString()
  @MaxLength(NAME_MAX_LENGTH)
  name!: string;

  @IsString()
  @MaxLength(SHORT_STRING_MAX_LENGTH)
  @IsIn([...ALLOWED_REGISTRATION_ROLES])
  role!: string;

  @IsString()
  @MaxLength(UUID_MAX_LENGTH)
  tenantId!: string;
}
