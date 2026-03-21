import { IsString, IsOptional, IsArray, IsNumber } from 'class-validator';

export class CreateTechnicianDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @IsNumber()
  @IsOptional()
  currentLat?: number;

  @IsNumber()
  @IsOptional()
  currentLng?: number;
}
