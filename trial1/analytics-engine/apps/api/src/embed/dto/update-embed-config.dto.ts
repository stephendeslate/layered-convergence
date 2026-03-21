import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateEmbedConfigDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedOrigins?: string[];

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
