import { IsString, MaxLength, IsDateString, IsOptional } from 'class-validator';

export class CreateScheduleDto {
  @IsDateString()
  @IsString()
  @MaxLength(50)
  startTime!: string;

  @IsDateString()
  @IsString()
  @MaxLength(50)
  endTime!: string;

  @IsString()
  @MaxLength(36)
  technicianId!: string;

  @IsString()
  @MaxLength(36)
  workOrderId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
