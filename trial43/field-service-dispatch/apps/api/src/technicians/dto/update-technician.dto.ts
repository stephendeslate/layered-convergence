import {
  IsString,
  IsEmail,
  MaxLength,
  IsOptional,
  IsNumber,
  IsArray,
  IsIn,
} from 'class-validator';
import { TECHNICIAN_STATUSES } from '@field-service-dispatch/shared';

export class UpdateTechnicianDto {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @IsString()
  @IsEmail()
  @MaxLength(255)
  @IsOptional()
  email?: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  phone?: string;

  @IsString()
  @MaxLength(20)
  @IsIn(TECHNICIAN_STATUSES as unknown as string[])
  @IsOptional()
  status?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specialties?: string[];

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsNumber()
  @IsOptional()
  hourlyRate?: number;
}
