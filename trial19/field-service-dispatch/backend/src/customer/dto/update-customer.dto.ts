import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCustomerDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  address?: string;
}
