import { IsString, IsNotEmpty, IsArray, IsObject, IsOptional } from 'class-validator';

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
