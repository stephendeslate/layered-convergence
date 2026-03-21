import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { TechnicianStatus } from '@prisma/client';

export class UpdateTechnicianDto {
  @IsString()
  @IsOptional()
  name?: string;

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

  @IsEnum(TechnicianStatus)
  @IsOptional()
  status?: TechnicianStatus;
}
