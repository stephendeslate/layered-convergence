import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';

// [TRACED:SEC-006] Register DTO restricts role with @IsIn excluding ADMIN
// [TRACED:API-008] @IsIn validates role to BUYER or SELLER only
export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  name!: string;

  @IsIn(['BUYER', 'SELLER'])
  role!: string;
}
