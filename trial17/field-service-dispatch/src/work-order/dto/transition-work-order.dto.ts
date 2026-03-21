import { IsEnum } from 'class-validator';
import { WorkOrderStatus } from '@prisma/client';

export class TransitionWorkOrderDto {
  @IsEnum(WorkOrderStatus)
  status!: WorkOrderStatus;
}
