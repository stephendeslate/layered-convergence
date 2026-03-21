import { IsString, IsEmail, IsArray, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { TechnicianStatus } from '../../../generated/prisma/client.js';

export class UpdateTechnicianDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(TechnicianStatus)
  status?: TechnicianStatus;

  @IsOptional()
  @IsNumber()
  currentLat?: number;

  @IsOptional()
  @IsNumber()
  currentLng?: number;
}
