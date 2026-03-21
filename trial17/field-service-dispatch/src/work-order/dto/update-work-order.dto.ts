import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { WorkOrderPriority } from '@prisma/client';

export class UpdateWorkOrderDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(WorkOrderPriority)
  @IsOptional()
  priority?: WorkOrderPriority;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @IsString()
  @IsOptional()
  technicianId?: string;

  @IsString()
  @IsOptional()
  customerId?: string;
}
