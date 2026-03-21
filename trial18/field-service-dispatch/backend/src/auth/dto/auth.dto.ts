import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

const ALLOWED_REGISTRATION_ROLES: Role[] = [Role.DISPATCHER, Role.TECHNICIAN];

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(Role, {
    message: `Role must be one of: ${ALLOWED_REGISTRATION_ROLES.join(', ')}`,
  })
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
