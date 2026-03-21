import { IsString, IsNotEmpty, IsOptional, IsEmail, IsArray, IsNumber, IsEnum } from 'class-validator';
import { TechnicianStatus } from '@prisma/client';

export class CreateTechnicianDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsArray()
  @IsOptional()
  skills?: string[];
}

export class UpdateTechnicianDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsArray()
  @IsOptional()
  skills?: string[];

  @IsEnum(TechnicianStatus)
  @IsOptional()
  status?: TechnicianStatus;
}

export class TechnicianLocationDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}
