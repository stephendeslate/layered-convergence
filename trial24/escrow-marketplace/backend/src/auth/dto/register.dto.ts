import { IsEmail, IsIn, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

// [TRACED:SEC-002] Registration DTO restricts role to BUYER or SELLER only
export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsIn([Role.BUYER, Role.SELLER])
  role!: Role;
}
