// [TRACED:FD-SM-006] @IsIn excludes ADMIN in register DTO
import { IsEmail, IsString, MinLength, IsIn } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsIn(['DISPATCHER', 'TECHNICIAN', 'MANAGER'])
  role!: string;

  @IsString()
  companyId!: string;
}
