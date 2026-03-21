import { IsArray, IsOptional, IsObject } from 'class-validator';

export class UpdateEmbedConfigDto {
  @IsArray()
  @IsOptional()
  allowedOrigins?: string[];

  @IsObject()
  @IsOptional()
  themeOverrides?: Record<string, any>;
}
