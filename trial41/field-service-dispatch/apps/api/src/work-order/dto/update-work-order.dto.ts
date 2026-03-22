import {
  IsString,
  MaxLength,
  IsNumber,
  IsOptional,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { WORK_ORDER_STATUSES } from '@field-service-dispatch/shared';

export class UpdateWorkOrderDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsIn([...WORK_ORDER_STATUSES])
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  priority?: number;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  technicianId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
