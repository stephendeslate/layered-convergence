// TRACED: FD-SCHED-002 — Update schedule DTO
import { IsString, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class UpdateScheduleDto {
  @IsString()
  @IsOptional()
  @MaxLength(36)
  technicianId?: string;

  @IsDateString()
  @IsOptional()
  @MaxLength(30)
  scheduledAt?: string;
}
