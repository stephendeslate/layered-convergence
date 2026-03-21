import { IsString, IsNotEmpty, IsArray, IsOptional, IsObject, IsUrl } from 'class-validator';

export class CreateEmbedConfigDto {
  @IsString()
  @IsNotEmpty()
  dashboardId!: string;

  @IsArray()
  @IsString({ each: true })
  allowedOrigins!: string[];

  @IsObject()
  @IsOptional()
  themeOverrides?: Record<string, unknown>;
}

export class UpdateEmbedConfigDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowedOrigins?: string[];

  @IsObject()
  @IsOptional()
  themeOverrides?: Record<string, unknown>;
}
