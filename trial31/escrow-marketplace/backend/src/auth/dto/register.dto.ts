import { IsEmail, IsString, MinLength, IsIn } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsIn(['BUYER', 'SELLER', 'ARBITER'])
  role!: 'BUYER' | 'SELLER' | 'ARBITER';
}
