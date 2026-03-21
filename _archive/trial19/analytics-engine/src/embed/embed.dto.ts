import { IsString, IsOptional, IsArray, IsObject } from 'class-validator';

export class CreateEmbedConfigDto {
  @IsString()
  dashboardId!: string;

  @IsOptional()
  @IsArray()
  allowedOrigins?: string[];

  @IsOptional()
  @IsObject()
  themeOverrides?: Record<string, unknown>;
}

export class UpdateEmbedConfigDto {
  @IsOptional()
  @IsArray()
  allowedOrigins?: string[];

  @IsOptional()
  @IsObject()
  themeOverrides?: Record<string, unknown>;
}
