import { IsNotEmpty, IsString, IsOptional, IsArray, IsBoolean, IsDateString } from 'class-validator';

export class CreateEmbedDto {
  @IsString()
  @IsNotEmpty()
  dashboardId!: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsArray()
  allowedOrigins?: string[];
}

export class UpdateEmbedDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsArray()
  allowedOrigins?: string[];
}
