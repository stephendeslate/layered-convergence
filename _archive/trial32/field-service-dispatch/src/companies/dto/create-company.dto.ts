import { IsString, IsOptional, IsNotEmpty, IsObject } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsObject()
  @IsOptional()
  serviceArea?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  branding?: Record<string, unknown>;
}
