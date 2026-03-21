// [TRACED:AE-SM-006] @IsIn excludes ADMIN role from registration
import { IsEmail, IsString, MinLength, IsIn, IsUUID } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsIn(['VIEWER', 'EDITOR', 'ANALYST'])
  role!: string;

  @IsUUID()
  tenantId!: string;
}
