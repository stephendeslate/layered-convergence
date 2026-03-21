import { IsEmail, IsIn, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsIn(['VIEWER', 'EDITOR', 'ANALYST'])
  role!: 'VIEWER' | 'EDITOR' | 'ANALYST';

  @IsNotEmpty()
  @IsString()
  tenantId!: string;
}
