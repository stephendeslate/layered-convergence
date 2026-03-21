import { IsString, IsOptional, IsUUID, IsNumber } from 'class-validator';

export class CreateCustomerDto {
  @IsUUID()
  companyId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
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
