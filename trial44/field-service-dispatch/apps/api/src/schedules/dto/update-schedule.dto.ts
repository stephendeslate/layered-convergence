import { IsString, MaxLength, IsOptional, IsDateString, IsIn } from 'class-validator';
import { SCHEDULE_STATUSES } from '@field-service-dispatch/shared';

export class UpdateScheduleDto {
  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsString()
  @MaxLength(20)
  @IsIn(SCHEDULE_STATUSES as unknown as string[])
  @IsOptional()
  status?: string;

  @IsString()
  @MaxLength(2000)
  @IsOptional()
  notes?: string;
}
