// [TRACED:AC-002] Registration DTO with @IsIn role restriction (no ADMIN)
import { IsEmail, IsString, MinLength, IsIn } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  tenantSlug!: string;

  @IsIn([Role.VIEWER, Role.EDITOR, Role.ANALYST])
  role!: Role;
}
