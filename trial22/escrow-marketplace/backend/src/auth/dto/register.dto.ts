import { IsEmail, IsNotEmpty, IsString, MinLength, IsIn } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @IsIn([Role.BUYER, Role.SELLER])
  role!: Role;
}
