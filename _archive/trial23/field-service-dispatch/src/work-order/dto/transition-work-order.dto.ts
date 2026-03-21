import { IsEnum, IsOptional, IsUUID, IsString } from 'class-validator';

export class TransitionWorkOrderDto {
  @IsEnum([
    'UNASSIGNED',
    'ASSIGNED',
    'EN_ROUTE',
    'ON_SITE',
    'IN_PROGRESS',
    'COMPLETED',
    'INVOICED',
    'PAID',
  ])
  status!: string;

  @IsOptional()
  @IsUUID()
  technicianId?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
