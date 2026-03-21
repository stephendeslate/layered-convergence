import {
  IsString,
  IsArray,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class CreateEmbedDto {
  @IsUUID()
  dashboardId!: string;

  @IsArray()
  @IsString({ each: true })
  allowedOrigins!: string[];

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdateEmbedDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedOrigins?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
