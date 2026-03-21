// [TRACED:SEC-006] @IsIn excludes ADMIN role from registration DTO

import { IsEmail, IsString, MinLength, IsIn } from 'class-validator';

enum Role {
  VIEWER = 'VIEWER',
  EDITOR = 'EDITOR',
  ANALYST = 'ANALYST',
}

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsIn([Role.VIEWER, Role.EDITOR, Role.ANALYST])
  role!: Role;

  @IsString()
  tenantId!: string;
}
