import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateTenantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsObject()
  branding?: {
    primaryColor?: string;
    fontFamily?: string;
    logoUrl?: string;
  };
}
