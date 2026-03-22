// TRACED: FD-AUTH-006 — Login DTO with input validation
import { IsEmail, IsString, MinLength, MaxLength, IsUUID } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @IsUUID()
  @MaxLength(36)
  tenantId: string;
}
