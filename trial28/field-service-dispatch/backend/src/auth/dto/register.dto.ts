import { IsEmail, IsString, MinLength, IsIn } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsIn(['DISPATCHER', 'TECHNICIAN', 'MANAGER'])
  role!: 'DISPATCHER' | 'TECHNICIAN' | 'MANAGER';
}
