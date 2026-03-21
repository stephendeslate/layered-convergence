import { IsString, IsArray, IsBoolean, IsOptional } from 'class-validator';

export class CreateEmbedConfigDto {
  @IsString()
  dashboardId!: string;

  @IsArray()
  @IsString({ each: true })
  allowedOrigins!: string[];

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
