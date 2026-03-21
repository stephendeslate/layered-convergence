import { IsString, IsOptional, IsEnum, IsDateString, IsUUID, IsBoolean, IsArray } from 'class-validator';
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
  @IsBoolean()
  autoAssign?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredSkills?: string[];
}
