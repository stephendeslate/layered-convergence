import { IsString, IsOptional, IsEmail, IsUUID, IsNumber } from 'class-validator';

export class CreateCustomerDto {
  @IsUUID()
  companyId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  address!: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsString()
  phone?: string;
}
