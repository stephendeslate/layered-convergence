import { IsString, IsOptional } from 'class-validator';

export class TimerStatusDto {
  activeTimers: number;
  nextExpiry: Date | null;
}

export class TriggerReleaseDto {
  @IsString()
  @IsOptional()
  transactionId?: string;
}
