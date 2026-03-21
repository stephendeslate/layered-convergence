import { IsString, IsNotEmpty, IsArray, IsOptional, IsObject } from 'class-validator';

export class CreateEmbedConfigDto {
  @IsString()
  @IsNotEmpty()
  dashboardId: string;

  @IsArray()
  @IsOptional()
  allowedOrigins?: string[];

  @IsObject()
  @IsOptional()
  themeOverrides?: Record<string, any>;
}
