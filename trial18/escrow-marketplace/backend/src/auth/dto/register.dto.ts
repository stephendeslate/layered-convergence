import { IsEmail, IsString, MinLength, IsIn } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsIn(['BUYER', 'SELLER'], {
    message: 'Role must be BUYER or SELLER. ADMIN registration is not allowed.',
  })
  role!: 'BUYER' | 'SELLER';
}
