// TRACED:REGISTER_NO_ADMIN — Registration DTO rejects ADMIN role via @IsIn validator
// TRACED:REGISTER_DTO_ISIN — RegisterDTO uses @IsIn(['DISPATCHER', 'TECHNICIAN'])

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
