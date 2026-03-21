import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';

// TRACED:PV-002 Two roles: DISPATCHER and TECHNICIAN
// TRACED:AC-002 Register validates role (no ADMIN)
export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsIn(['DISPATCHER', 'TECHNICIAN'])
  role!: 'DISPATCHER' | 'TECHNICIAN';

  @IsString()
  @MinLength(1)
  companyName!: string;
}
