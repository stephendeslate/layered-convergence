import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { WorkOrderStatus } from '../../../generated/prisma/client.js';

export class TransitionWorkOrderDto {
  @IsEnum(WorkOrderStatus)
  status!: WorkOrderStatus;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsUUID()
  technicianId?: string;
}
