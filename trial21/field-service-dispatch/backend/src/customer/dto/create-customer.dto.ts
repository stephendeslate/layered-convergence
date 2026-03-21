import { IsString, IsEmail } from 'class-validator';

// [TRACED:AC-006] CreateCustomerDto with field validation
export class CreateCustomerDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  address: string;
}
