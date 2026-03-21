import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { WorkOrderPriority } from '@prisma/client';

export class UpdateWorkOrderDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(WorkOrderPriority)
  priority?: WorkOrderPriority;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  customerId?: string;
}
