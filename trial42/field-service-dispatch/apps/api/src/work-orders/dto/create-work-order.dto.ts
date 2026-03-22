// TRACED: FD-CREATE-WORK-ORDER-DTO
import {
  IsString,
  MaxLength,
  IsOptional,
  IsNumber,
  IsIn,
} from 'class-validator';
import { WORK_ORDER_STATUSES } from '@field-service-dispatch/shared';

export class CreateWorkOrderDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  @MaxLength(2000)
  description: string;

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
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  @MaxLength(500)
  address: string;

  @IsString()
  @MaxLength(36)
  tenantId: string;

  @IsString()
  @MaxLength(36)
  @IsOptional()
  technicianId?: string;

  @IsString()
  @MaxLength(2000)
  @IsOptional()
  notes?: string;
}
