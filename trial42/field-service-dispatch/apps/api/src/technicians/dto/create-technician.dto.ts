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

export class CreateTechnicianDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MaxLength(20)
  phone: string;

  @IsString()
  @MaxLength(20)
  @IsIn(TECHNICIAN_STATUSES as unknown as string[])
  @IsOptional()
  status?: string;

  @IsArray()
  @IsString({ each: true })
  specialties: string[];

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  @MaxLength(36)
  tenantId: string;
}
