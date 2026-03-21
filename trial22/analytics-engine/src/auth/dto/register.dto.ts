// [TRACED:AC-003] Register DTO with @IsIn validation restricting to VIEWER, EDITOR, ANALYST
// [TRACED:SEC-010] Role validation prevents unauthorized role assignment

import { IsEmail, IsString, MinLength, IsIn, IsUUID } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsIn([Role.VIEWER, Role.EDITOR, Role.ANALYST])
  role!: Role;

  @IsUUID()
  tenantId!: string;
}
