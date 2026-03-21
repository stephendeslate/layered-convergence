import { IsString, IsOptional } from 'class-validator';

export class UpdateThemeDto {
  @IsString()
  @IsOptional()
  primaryColor?: string;

  @IsString()
  @IsOptional()
  fontFamily?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;
}
