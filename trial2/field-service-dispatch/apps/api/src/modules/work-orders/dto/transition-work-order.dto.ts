import { IsEnum, IsOptional, IsString } from 'class-validator';
import { WorkOrderStatus } from '@field-service/shared';

export class TransitionWorkOrderDto {
  @IsEnum(WorkOrderStatus)
  toStatus: WorkOrderStatus;

  @IsOptional()
  @IsString()
  note?: string;
}
