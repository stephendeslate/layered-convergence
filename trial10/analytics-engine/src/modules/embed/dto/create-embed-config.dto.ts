import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateEmbedConfigDto {
  @IsString()
  dashboardId!: string;

  @IsOptional()
  @IsArray()
  allowedOrigins?: string[];

  @IsOptional()
  themeOverrides?: Record<string, unknown>;
}
