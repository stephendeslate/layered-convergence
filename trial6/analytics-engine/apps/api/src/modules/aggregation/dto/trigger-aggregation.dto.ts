import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum AggregationPeriod {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
}

export class TriggerAggregationDto {
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsEnum(AggregationPeriod)
  @IsOptional()
  period?: AggregationPeriod;
}

export class AggregationStatusDto {
  lastRunAt: Date | null;
  isRunning: boolean;
  totalAggregated: number;
}
