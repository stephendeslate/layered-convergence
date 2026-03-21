import { IsArray, IsObject, IsOptional } from 'class-validator';

export class UpdateEmbedConfigDto {
  @IsArray()
  @IsOptional()
  allowedOrigins?: string[];

  @IsObject()
  @IsOptional()
  themeOverrides?: Record<string, any>;
}
