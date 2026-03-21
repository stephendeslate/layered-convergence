import { IsString, IsArray, IsOptional, IsObject } from 'class-validator';

export class CreateEmbedConfigDto {
  @IsString()
  dashboardId: string;

  @IsArray()
  @IsString({ each: true })
  allowedOrigins: string[];

  @IsOptional()
  @IsObject()
  themeOverrides?: Record<string, any>;
}
