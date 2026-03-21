import { IsIn } from 'class-validator';
import { WorkOrderStatus } from '@prisma/client';

export class TransitionWorkOrderDto {
  @IsIn([
    'OPEN',
    'ASSIGNED',
    'IN_PROGRESS',
    'COMPLETED',
    'INVOICED',
    'CLOSED',
    'CANCELLED',
  ])
  status!: WorkOrderStatus;
}
