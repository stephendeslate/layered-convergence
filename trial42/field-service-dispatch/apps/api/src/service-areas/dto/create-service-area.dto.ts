import {
  IsString,
  MaxLength,
  IsOptional,
  IsNumber,
  IsArray,
  IsBoolean,
} from 'class-validator';

export class CreateServiceAreaDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsArray()
  @IsString({ each: true })
  zipCodes: string[];

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsNumber()
  radius: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsString()
  @MaxLength(36)
  tenantId: string;
}
