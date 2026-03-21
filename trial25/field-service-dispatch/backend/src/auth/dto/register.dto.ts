// [TRACED:SEC-003] RegisterDto uses @IsIn to exclude ADMIN from self-registration
import { IsEmail, IsString, MinLength, IsIn } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsIn(['DISPATCHER', 'TECHNICIAN'])
  role: string;

  @IsString()
  companyId: string;
}
