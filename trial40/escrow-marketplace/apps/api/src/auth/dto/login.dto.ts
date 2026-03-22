// TRACED: EM-AUTH-005 — Login DTO with string validation
import { IsString, IsEmail, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(128)
  password!: string;

  @IsString()
  @MaxLength(36)
  tenantId!: string;
}
