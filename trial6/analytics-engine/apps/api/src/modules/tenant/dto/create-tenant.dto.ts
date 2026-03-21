import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  primaryColor?: string;

  @IsString()
  @IsOptional()
  fontFamily?: string;

  @IsUrl()
  @IsOptional()
  logoUrl?: string;
}
