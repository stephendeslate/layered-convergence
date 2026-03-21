import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsObject,
} from 'class-validator';

export class EmbedConfigDto {
  @IsString()
  @IsNotEmpty()
  dashboardId: string;

  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsArray()
  @IsOptional()
  allowedOrigins?: string[];

  @IsObject()
  @IsOptional()
  themeOverrides?: Record<string, unknown>;
}
