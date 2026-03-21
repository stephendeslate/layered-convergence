import { IsIn } from 'class-validator';
import { WorkOrderStatus } from '@prisma/client';

export class TransitionWorkOrderDto {
  @IsIn([
    WorkOrderStatus.PENDING,
    WorkOrderStatus.ASSIGNED,
    WorkOrderStatus.IN_PROGRESS,
    WorkOrderStatus.ON_HOLD,
    WorkOrderStatus.COMPLETED,
    WorkOrderStatus.INVOICED,
  ])
  status!: WorkOrderStatus;
}
