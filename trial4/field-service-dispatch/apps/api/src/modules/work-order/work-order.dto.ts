import { IsString, IsOptional, IsEnum, IsDateString, MinLength } from 'class-validator';

export enum PriorityEnum {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum WorkOrderStatusEnum {
  UNASSIGNED = 'UNASSIGNED',
  ASSIGNED = 'ASSIGNED',
  EN_ROUTE = 'EN_ROUTE',
  ON_SITE = 'ON_SITE',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  INVOICED = 'INVOICED',
  PAID = 'PAID',
}

export class CreateWorkOrderDto {
  @IsString()
  customerId: string;

  @IsOptional()
  @IsString()
  technicianId?: string;

  @IsOptional()
  @IsEnum(PriorityEnum)
  priority?: PriorityEnum;

  @IsString()
  @MinLength(1)
  description: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}

export class TransitionWorkOrderDto {
  @IsEnum(WorkOrderStatusEnum)
  toStatus: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class AssignWorkOrderDto {
  @IsString()
  technicianId: string;
}
