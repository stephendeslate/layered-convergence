// [TRACED:EM-SM-006] @IsIn excludes ADMIN role from registration
import { IsEmail, IsString, MinLength, IsIn, IsUUID } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsIn(['BUYER', 'SELLER', 'ARBITER'])
  role!: string;

  @IsUUID()
  tenantId!: string;
}
