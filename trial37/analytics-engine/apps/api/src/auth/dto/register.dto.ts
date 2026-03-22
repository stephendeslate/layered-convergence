// TRACED: AE-AUTH-01
// TRACED: AE-AUTH-02
import { IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@analytics-engine/shared';

export class RegisterDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsIn(ALLOWED_REGISTRATION_ROLES)
  @MaxLength(50)
  role!: string;
}
