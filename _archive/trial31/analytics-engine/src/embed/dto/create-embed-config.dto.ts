import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateEmbedConfigDto {
  @IsString()
  dashboardId!: string;

  @IsOptional()
  @IsArray()
  allowedOrigins?: string[];

  @IsOptional()
  themeOverrides?: Record<string, unknown>;
}
