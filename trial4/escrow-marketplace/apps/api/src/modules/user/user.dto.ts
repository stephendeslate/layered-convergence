import { IsString, IsEmail, IsEnum, IsOptional, MinLength } from 'class-validator';

export enum UserRole {
  BUYER = 'BUYER',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN',
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsEnum(UserRole)
  role: UserRole;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
