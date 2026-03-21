import { IsEmail, IsString, MinLength, IsIn, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

// [TRACED:AC-002] RegisterDto validates role with @IsIn restricted to DISPATCHER/TECHNICIAN
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsIn([Role.DISPATCHER, Role.TECHNICIAN])
  role: Role;

  @IsString()
  companySlug: string;

  @IsOptional()
  @IsString()
  companyName?: string;
}
