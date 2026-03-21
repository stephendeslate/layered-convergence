import { IsString, IsOptional, IsInt, Min, Max, IsUrl } from 'class-validator';

export class UpdateThemeDto {
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @IsOptional()
  @IsString()
  textColor?: string;

  @IsOptional()
  @IsString()
  fontFamily?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(32)
  cornerRadius?: number;

  @IsOptional()
  @IsString()
  logoUrl?: string | null;
}
