import { IsString, IsOptional, IsEmail, IsArray, IsNumber, IsEnum } from 'class-validator';
import { TechnicianAvailability } from '@prisma/client';

export class UpdateTechnicianDto {
  @IsEmail()
  @IsOptional()
  email?: string;

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

  @IsEnum(TechnicianAvailability)
  @IsOptional()
  availability?: TechnicianAvailability;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;
}
