import { IsIn, IsOptional, IsString } from 'class-validator';
import { WorkOrderStatus } from '@prisma/client';

// [TRACED:AC-008] TransitionWorkOrderDto validates status with @IsIn
export class TransitionWorkOrderDto {
  @IsIn([
    WorkOrderStatus.PENDING,
    WorkOrderStatus.ASSIGNED,
    WorkOrderStatus.IN_PROGRESS,
    WorkOrderStatus.COMPLETED,
    WorkOrderStatus.ON_HOLD,
    WorkOrderStatus.INVOICED,
  ])
  status: WorkOrderStatus;

  @IsOptional()
  @IsString()
  technicianId?: string;
}
