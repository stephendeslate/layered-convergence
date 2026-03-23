import { IsString, MaxLength, IsOptional, IsDateString, IsIn } from 'class-validator';
import { SCHEDULE_STATUSES } from '@field-service-dispatch/shared';

export class CreateScheduleDto {
  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsString()
  @MaxLength(20)
  @IsIn(SCHEDULE_STATUSES as unknown as string[])
  @IsOptional()
  status?: string;

  @IsString()
  @MaxLength(36)
  tenantId: string;

  @IsString()
  @MaxLength(36)
  technicianId: string;

  @IsString()
  @MaxLength(36)
  workOrderId: string;

  @IsString()
  @MaxLength(2000)
  @IsOptional()
  notes?: string;
}
