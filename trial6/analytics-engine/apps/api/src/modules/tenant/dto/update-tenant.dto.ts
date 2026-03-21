import { IsString, IsOptional, IsUrl } from 'class-validator';

export class UpdateTenantDto {
  @IsString()
  @IsOptional()
  name?: string;

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
