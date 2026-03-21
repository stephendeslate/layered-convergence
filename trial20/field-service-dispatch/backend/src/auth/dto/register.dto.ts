import { IsEmail, IsString, MinLength, IsIn, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

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
