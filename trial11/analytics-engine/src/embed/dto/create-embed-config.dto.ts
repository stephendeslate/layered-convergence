import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateEmbedConfigDto {
  @IsString()
  @IsNotEmpty()
  dashboardId: string;

  @IsArray()
  @IsString({ each: true })
  allowedOrigins: string[];

  @IsObject()
  @IsOptional()
  themeOverrides?: Record<string, unknown>;
}
