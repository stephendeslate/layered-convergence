import { IsEmail, IsString, MinLength, IsIn } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  name!: string;

  @IsString()
  tenantId!: string;

  // TRACED: AE-SEC-ADMIN-001 — @IsIn excludes ADMIN role from registration
  @IsIn(['OWNER', 'ANALYST', 'VIEWER'], {
    message: 'Role must be one of: OWNER, ANALYST, VIEWER',
  })
  role!: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
