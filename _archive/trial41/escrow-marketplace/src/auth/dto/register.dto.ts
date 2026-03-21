import { IsEmail, IsEnum, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsEnum(['BUYER', 'PROVIDER'])
  role?: 'BUYER' | 'PROVIDER';
}
