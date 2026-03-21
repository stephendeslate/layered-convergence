import { IsString, IsArray, IsOptional, IsObject } from 'class-validator';

export class UpdateEmbedConfigDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedOrigins?: string[];

  @IsOptional()
  @IsObject()
  themeOverrides?: Record<string, any>;
}
