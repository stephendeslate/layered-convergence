import { IsOptional, IsArray } from 'class-validator';

export class UpdateEmbedConfigDto {
  @IsOptional()
  @IsArray()
  allowedOrigins?: string[];

  @IsOptional()
  themeOverrides?: Record<string, unknown>;
}
