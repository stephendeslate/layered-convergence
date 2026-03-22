// TRACED: FD-SCHED-001 — Create schedule DTO with validation
import { IsString, IsDateString, MaxLength } from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  @MaxLength(36)
  workOrderId!: string;

  @IsString()
  @MaxLength(36)
  technicianId!: string;

  @IsDateString()
  @MaxLength(30)
  scheduledAt!: string;
}
