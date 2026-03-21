import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, IsDateString } from 'class-validator';

export class CreateEmbedDto {
  @IsString()
  @IsNotEmpty()
  dashboardId!: string;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowedOrigins?: string[];
}

export class UpdateEmbedDto {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowedOrigins?: string[];
}
