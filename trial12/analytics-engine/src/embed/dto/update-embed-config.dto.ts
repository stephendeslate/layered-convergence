import { IsArray, IsOptional, IsObject, IsString } from 'class-validator';

export class UpdateEmbedConfigDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedOrigins?: string[];

  @IsOptional()
  @IsObject()
  themeOverrides?: Record<string, any>;
}
