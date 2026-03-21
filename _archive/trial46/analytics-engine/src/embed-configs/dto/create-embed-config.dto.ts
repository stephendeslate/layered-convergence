import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEmbedConfigDto {
  @IsString()
  @IsNotEmpty()
  dashboardId!: string;

  @IsArray()
  @IsString({ each: true })
  allowedOrigins!: string[];

  @IsOptional()
  themeOverrides?: any;
}
