// [TRACED:SEC-006] Registration DTO uses @IsIn(['DISPATCHER', 'TECHNICIAN']) excluding ADMIN
// [TRACED:API-001] RegisterDto validates email, password (min 8), role, companyId

import { IsEmail, IsIn, IsString, IsUUID, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsIn(['DISPATCHER', 'TECHNICIAN'])
  role!: 'DISPATCHER' | 'TECHNICIAN';

  @IsUUID()
  companyId!: string;
}
