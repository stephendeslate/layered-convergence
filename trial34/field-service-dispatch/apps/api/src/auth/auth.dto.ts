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

  // TRACED: FD-SEC-ADMIN-001 — @IsIn excludes ADMIN role from registration
  @IsIn(['OWNER', 'DISPATCHER', 'TECHNICIAN'], {
    message: 'Role must be one of: OWNER, DISPATCHER, TECHNICIAN',
  })
  role!: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
