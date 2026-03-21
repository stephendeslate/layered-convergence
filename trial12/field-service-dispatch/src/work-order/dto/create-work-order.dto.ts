import { IsString, IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { WorkOrderPriority } from '../../../generated/prisma/client.js';

export class CreateWorkOrderDto {
  @IsUUID()
  customerId!: string;

  @IsOptional()
  @IsUUID()
  technicianId?: string;

  @IsOptional()
  @IsEnum(WorkOrderPriority)
  priority?: WorkOrderPriority;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
