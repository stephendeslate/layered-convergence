import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  primaryColor?: string;

  @IsUrl()
  @IsOptional()
  logoUrl?: string;
}

export class UpdateCompanyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  primaryColor?: string;

  @IsUrl()
  @IsOptional()
  logoUrl?: string;
}
