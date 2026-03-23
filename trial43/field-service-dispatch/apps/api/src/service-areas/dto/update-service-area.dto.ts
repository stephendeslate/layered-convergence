import {
  IsString,
  MaxLength,
  IsOptional,
  IsNumber,
  IsArray,
  IsBoolean,
} from 'class-validator';

export class UpdateServiceAreaDto {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  zipCodes?: string[];

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsNumber()
  @IsOptional()
  radius?: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
