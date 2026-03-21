import { IsUUID, IsOptional, IsArray, IsString, IsObject } from 'class-validator';

export class CreateEmbedConfigDto {
  @IsUUID()
  dashboardId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedOrigins?: string[];

  @IsOptional()
  @IsObject()
  themeOverrides?: Record<string, unknown>;
}
