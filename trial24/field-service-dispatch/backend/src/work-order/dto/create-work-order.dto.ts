// [TRACED:API-004] CreateWorkOrderDto validates title, description, priority, scheduledDate, customerId, technicianId

import { IsString, IsOptional, IsUUID, IsDateString } from 'class-validator';

export class CreateWorkOrderDto {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  priority?: string;

  @IsDateString()
  @IsOptional()
  scheduledDate?: string;

  @IsUUID()
  customerId!: string;

  @IsUUID()
  @IsOptional()
  technicianId?: string;
}
