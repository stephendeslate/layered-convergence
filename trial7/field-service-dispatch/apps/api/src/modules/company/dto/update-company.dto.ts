import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsObject()
  branding?: Record<string, string>;

  @IsOptional()
  @IsObject()
  serviceArea?: Record<string, unknown>;
}
