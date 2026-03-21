import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateEmbedConfigDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedOrigins?: string[];

  @IsOptional()
  themeOverrides?: any;
}
