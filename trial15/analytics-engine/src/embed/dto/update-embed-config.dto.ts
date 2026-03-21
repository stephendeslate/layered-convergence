import { IsOptional, IsArray, IsString, IsDateString } from 'class-validator';

export class UpdateEmbedConfigDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowedOrigins?: string[];

  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}
