import {
  IsString,
  MaxLength,
  IsNumber,
  IsOptional,
  IsArray,
  IsEmail,
  IsIn,
} from 'class-validator';
import { TECHNICIAN_STATUSES } from '@field-service-dispatch/shared';

export class UpdateTechnicianDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsEmail()
  @IsString()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsIn([...TECHNICIAN_STATUSES])
  status?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}
