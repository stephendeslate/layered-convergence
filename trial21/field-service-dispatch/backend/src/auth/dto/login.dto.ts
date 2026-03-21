import { IsEmail, IsString, MinLength } from 'class-validator';

// [TRACED:AC-003] LoginDto with email and password validation
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
