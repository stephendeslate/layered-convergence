import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateCompanyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsObject()
  @IsOptional()
  serviceArea?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  branding?: Record<string, unknown>;
}
