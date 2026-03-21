import { IsOptional, IsArray, IsObject } from 'class-validator';

export class UpdateEmbedConfigDto {
  @IsOptional()
  @IsArray()
  allowedOrigins?: string[];

  @IsOptional()
  @IsObject()
  themeOverrides?: Record<string, unknown>;
}
