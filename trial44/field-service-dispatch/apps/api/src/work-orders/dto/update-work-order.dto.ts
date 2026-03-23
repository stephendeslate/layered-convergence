import {
  IsString,
  MaxLength,
  IsOptional,
  IsNumber,
  IsIn,
} from 'class-validator';
import { WORK_ORDER_STATUSES } from '@field-service-dispatch/shared';

export class UpdateWorkOrderDto {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  title?: string;

  @IsString()
  @MaxLength(2000)
  @IsOptional()
  description?: string;

  @IsString()
  @MaxLength(20)
  @IsIn(WORK_ORDER_STATUSES as unknown as string[])
  @IsOptional()
  status?: string;

  @IsString()
  @MaxLength(10)
  @IsOptional()
  priority?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  address?: string;

  @IsString()
  @MaxLength(36)
  @IsOptional()
  technicianId?: string;

  @IsString()
  @MaxLength(2000)
  @IsOptional()
  notes?: string;

  @IsNumber()
  @IsOptional()
  estimatedCost?: number;
}
