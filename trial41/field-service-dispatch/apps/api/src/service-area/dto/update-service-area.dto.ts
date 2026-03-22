import {
  IsString,
  MaxLength,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
} from 'class-validator';

export class UpdateServiceAreaDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  zipCodes?: string[];

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  radius?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
