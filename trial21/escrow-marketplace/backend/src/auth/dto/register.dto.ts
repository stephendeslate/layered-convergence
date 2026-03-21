import { IsEmail, IsString, MinLength, IsIn } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  // [TRACED:DM-002] Role restricted to BUYER/SELLER only via @IsIn validator
  @IsIn([Role.BUYER, Role.SELLER])
  role: Role;
}
