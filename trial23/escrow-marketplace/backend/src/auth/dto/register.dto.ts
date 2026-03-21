import { IsEmail, IsIn, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  // TRACED:AC-003: Register endpoint rejects ADMIN role
  // TRACED:PV-001: Platform supports exactly two roles: BUYER and SELLER
  @IsIn([Role.BUYER, Role.SELLER])
  role: Role;
}
