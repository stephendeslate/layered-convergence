import { IsString, IsOptional, IsArray, IsEnum, IsNumber, IsNotEmpty, IsEmail } from 'class-validator';
import { TechnicianAvailability } from '@prisma/client';

export class CreateTechnicianDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];
}

export class UpdateTechnicianDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsEnum(TechnicianAvailability)
  availability?: TechnicianAvailability;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class UpdateAvailabilityDto {
  @IsEnum(TechnicianAvailability)
  availability!: TechnicianAvailability;
}
