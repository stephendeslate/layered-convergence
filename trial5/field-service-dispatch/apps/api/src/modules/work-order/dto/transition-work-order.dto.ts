import { IsEnum, IsOptional, IsString } from 'class-validator';
import { WorkOrderStatus } from '@prisma/client';

export class TransitionWorkOrderDto {
  @IsEnum(WorkOrderStatus)
  toStatus: WorkOrderStatus;

  @IsOptional()
  @IsString()
  note?: string;
}
