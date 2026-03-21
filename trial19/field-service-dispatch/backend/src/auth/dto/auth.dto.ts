import { IsEmail, IsIn, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsIn([Role.DISPATCHER, Role.TECHNICIAN])
  role!: Role;

  @IsString()
  @IsNotEmpty()
  companyName!: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: Role;
    companyId: string;
  };
}
