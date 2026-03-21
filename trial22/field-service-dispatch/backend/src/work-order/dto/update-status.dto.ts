import { IsIn } from 'class-validator';
import { WorkOrderStatus } from '@prisma/client';

export class UpdateStatusDto {
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
