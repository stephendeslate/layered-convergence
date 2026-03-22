import { IsString, MaxLength, IsDateString, IsOptional, IsIn } from 'class-validator';
import { SCHEDULE_STATUSES } from '@field-service-dispatch/shared';

export class UpdateScheduleDto {
  @IsOptional()
  @IsDateString()
  @IsString()
  @MaxLength(50)
  startTime?: string;

  @IsOptional()
  @IsDateString()
  @IsString()
  @MaxLength(50)
  endTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsIn([...SCHEDULE_STATUSES])
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
