import { IsEmail, IsString, MinLength, IsIn } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsIn(['VIEWER', 'EDITOR', 'ANALYST'])
  role!: 'VIEWER' | 'EDITOR' | 'ANALYST';

  @IsString()
  tenantId!: string;
}
