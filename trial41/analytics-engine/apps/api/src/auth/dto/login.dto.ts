// TRACED:AE-AUTH-LOGIN-DTO
import { IsString, IsEmail, MaxLength } from 'class-validator';
import { NAME_MAX_LENGTH, SHORT_STRING_MAX_LENGTH } from '@analytics-engine/shared';

export class LoginDto {
  @IsString()
  @IsEmail()
  @MaxLength(NAME_MAX_LENGTH)
  email!: string;

  @IsString()
  @MaxLength(SHORT_STRING_MAX_LENGTH)
  password!: string;
}
